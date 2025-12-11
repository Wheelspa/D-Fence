from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, BackgroundTasks
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt
import qrcode
from io import BytesIO
import base64
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, black, white
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Settings
SECRET_KEY = os.environ.get('JWT_SECRET', 'dfence-warranty-secret-key-2024')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Security
security = HTTPBearer()

# Create the main app
app = FastAPI(title="D-Fence Warranty Management API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============== MODELS ==============

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    created_at: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class WarrantyCreate(BaseModel):
    customer_name: str
    customer_email: EmailStr
    customer_phone: str
    vehicle_make: str
    vehicle_model: str
    vehicle_year: str
    vehicle_vin: Optional[str] = None
    vehicle_color: Optional[str] = None
    ppf_product: str
    ppf_coverage: str  # Full Body, Partial, etc.
    installation_date: str
    warranty_years: int = 5

class WarrantyResponse(BaseModel):
    id: str
    warranty_code: str
    customer_name: str
    customer_email: str
    customer_phone: str
    vehicle_make: str
    vehicle_model: str
    vehicle_year: str
    vehicle_vin: Optional[str] = None
    vehicle_color: Optional[str] = None
    ppf_product: str
    ppf_coverage: str
    installation_date: str
    warranty_years: int
    expiry_date: str
    status: str
    qr_code: str
    created_at: str
    created_by: str

class WarrantyVerifyResponse(BaseModel):
    is_valid: bool
    warranty: Optional[WarrantyResponse] = None
    message: str

class DashboardStats(BaseModel):
    total_warranties: int
    active_warranties: int
    expiring_soon: int
    expired_warranties: int
    monthly_data: List[dict]

# ============== HELPER FUNCTIONS ==============

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if user is None:
        raise credentials_exception
    return user

def generate_warranty_code() -> str:
    """Generate a unique warranty code like DF-XXXX-XXXX"""
    import random
    import string
    chars = string.ascii_uppercase + string.digits
    part1 = ''.join(random.choices(chars, k=4))
    part2 = ''.join(random.choices(chars, k=4))
    return f"DF-{part1}-{part2}"

def generate_qr_code(data: str) -> str:
    """Generate QR code and return as base64 string"""
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buffer = BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)
    return base64.b64encode(buffer.getvalue()).decode()

def calculate_expiry_date(installation_date: str, warranty_years: int) -> str:
    """Calculate warranty expiry date"""
    install_date = datetime.fromisoformat(installation_date.replace('Z', '+00:00'))
    expiry_date = install_date + timedelta(days=warranty_years * 365)
    return expiry_date.isoformat()

def get_warranty_status(expiry_date: str) -> str:
    """Determine warranty status based on expiry date"""
    expiry = datetime.fromisoformat(expiry_date.replace('Z', '+00:00'))
    now = datetime.now(timezone.utc)
    
    # Ensure both datetimes are timezone-aware
    if expiry.tzinfo is None:
        expiry = expiry.replace(tzinfo=timezone.utc)
    
    if expiry < now:
        return "expired"
    elif expiry < now + timedelta(days=30):
        return "expiring_soon"
    else:
        return "active"

# ============== AUTH ROUTES ==============

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user_id = str(uuid.uuid4())
    hashed_password = get_password_hash(user_data.password)
    
    user_doc = {
        "id": user_id,
        "email": user_data.email,
        "name": user_data.name,
        "password": hashed_password,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_doc)
    
    # Generate token
    access_token = create_access_token(
        data={"sub": user_id},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return TokenResponse(
        access_token=access_token,
        user=UserResponse(
            id=user_id,
            email=user_data.email,
            name=user_data.name,
            created_at=user_doc["created_at"]
        )
    )

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    access_token = create_access_token(
        data={"sub": user["id"]},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return TokenResponse(
        access_token=access_token,
        user=UserResponse(
            id=user["id"],
            email=user["email"],
            name=user["name"],
            created_at=user["created_at"]
        )
    )

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=current_user["id"],
        email=current_user["email"],
        name=current_user["name"],
        created_at=current_user["created_at"]
    )

# ============== WARRANTY ROUTES ==============

@api_router.post("/warranties", response_model=WarrantyResponse)
async def create_warranty(warranty_data: WarrantyCreate, current_user: dict = Depends(get_current_user)):
    warranty_id = str(uuid.uuid4())
    warranty_code = generate_warranty_code()
    
    # Ensure unique warranty code
    while await db.warranties.find_one({"warranty_code": warranty_code}):
        warranty_code = generate_warranty_code()
    
    expiry_date = calculate_expiry_date(warranty_data.installation_date, warranty_data.warranty_years)
    status = get_warranty_status(expiry_date)
    
    # Generate QR code with verification URL
    verification_url = f"{os.environ.get('FRONTEND_URL', 'http://localhost:3000')}/verify/{warranty_code}"
    qr_code = generate_qr_code(verification_url)
    
    warranty_doc = {
        "id": warranty_id,
        "warranty_code": warranty_code,
        "customer_name": warranty_data.customer_name,
        "customer_email": warranty_data.customer_email,
        "customer_phone": warranty_data.customer_phone,
        "vehicle_make": warranty_data.vehicle_make,
        "vehicle_model": warranty_data.vehicle_model,
        "vehicle_year": warranty_data.vehicle_year,
        "vehicle_vin": warranty_data.vehicle_vin,
        "vehicle_color": warranty_data.vehicle_color,
        "ppf_product": warranty_data.ppf_product,
        "ppf_coverage": warranty_data.ppf_coverage,
        "installation_date": warranty_data.installation_date,
        "warranty_years": warranty_data.warranty_years,
        "expiry_date": expiry_date,
        "status": status,
        "qr_code": qr_code,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": current_user["id"]
    }
    
    await db.warranties.insert_one(warranty_doc)
    
    return WarrantyResponse(**{k: v for k, v in warranty_doc.items() if k != "_id"})

@api_router.get("/warranties", response_model=List[WarrantyResponse])
async def get_warranties(
    search: Optional[str] = None,
    status_filter: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {}
    
    if search:
        query["$or"] = [
            {"customer_name": {"$regex": search, "$options": "i"}},
            {"warranty_code": {"$regex": search, "$options": "i"}},
            {"vehicle_make": {"$regex": search, "$options": "i"}},
            {"vehicle_model": {"$regex": search, "$options": "i"}},
            {"customer_email": {"$regex": search, "$options": "i"}}
        ]
    
    if status_filter and status_filter != "all":
        query["status"] = status_filter
    
    warranties = await db.warranties.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    
    # Update status for each warranty
    for warranty in warranties:
        warranty["status"] = get_warranty_status(warranty["expiry_date"])
    
    return [WarrantyResponse(**w) for w in warranties]

@api_router.get("/warranties/{warranty_id}", response_model=WarrantyResponse)
async def get_warranty(warranty_id: str, current_user: dict = Depends(get_current_user)):
    warranty = await db.warranties.find_one({"id": warranty_id}, {"_id": 0})
    if not warranty:
        raise HTTPException(status_code=404, detail="Warranty not found")
    
    warranty["status"] = get_warranty_status(warranty["expiry_date"])
    return WarrantyResponse(**warranty)

@api_router.delete("/warranties/{warranty_id}")
async def delete_warranty(warranty_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.warranties.delete_one({"id": warranty_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Warranty not found")
    return {"message": "Warranty deleted successfully"}

# ============== PUBLIC VERIFICATION ROUTE ==============

@api_router.get("/verify/{warranty_code}", response_model=WarrantyVerifyResponse)
async def verify_warranty(warranty_code: str):
    warranty = await db.warranties.find_one({"warranty_code": warranty_code}, {"_id": 0})
    
    if not warranty:
        return WarrantyVerifyResponse(
            is_valid=False,
            warranty=None,
            message="Warranty not found. Please check the warranty code."
        )
    
    warranty["status"] = get_warranty_status(warranty["expiry_date"])
    
    if warranty["status"] == "expired":
        return WarrantyVerifyResponse(
            is_valid=False,
            warranty=WarrantyResponse(**warranty),
            message="This warranty has expired."
        )
    
    return WarrantyVerifyResponse(
        is_valid=True,
        warranty=WarrantyResponse(**warranty),
        message="Warranty is valid and active."
    )

# ============== PDF GENERATION ==============

@api_router.get("/warranties/{warranty_id}/pdf")
async def generate_warranty_pdf(warranty_id: str):
    warranty = await db.warranties.find_one({"id": warranty_id}, {"_id": 0})
    if not warranty:
        raise HTTPException(status_code=404, detail="Warranty not found")
    
    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4
    
    # Background color
    p.setFillColor(HexColor("#050505"))
    p.rect(0, 0, width, height, fill=1)
    
    # Gold border
    p.setStrokeColor(HexColor("#D4AF37"))
    p.setLineWidth(3)
    p.rect(20, 20, width - 40, height - 40, stroke=1, fill=0)
    
    # Header
    p.setFillColor(HexColor("#D4AF37"))
    p.setFont("Helvetica-Bold", 36)
    p.drawCentredString(width/2, height - 80, "D-FENCE")
    
    p.setFillColor(HexColor("#A1A1AA"))
    p.setFont("Helvetica", 12)
    p.drawCentredString(width/2, height - 100, "by Wheelspa Private Limited")
    
    p.setFillColor(white)
    p.setFont("Helvetica-Bold", 24)
    p.drawCentredString(width/2, height - 150, "WARRANTY CERTIFICATE")
    
    # Warranty Code
    p.setFillColor(HexColor("#00F0FF"))
    p.setFont("Helvetica-Bold", 14)
    p.drawCentredString(width/2, height - 180, f"Certificate No: {warranty['warranty_code']}")
    
    # Details section
    y_pos = height - 230
    left_margin = 60
    
    p.setFillColor(HexColor("#D4AF37"))
    p.setFont("Helvetica-Bold", 14)
    p.drawString(left_margin, y_pos, "CUSTOMER DETAILS")
    
    y_pos -= 25
    p.setFillColor(white)
    p.setFont("Helvetica", 11)
    
    details = [
        ("Customer Name:", warranty["customer_name"]),
        ("Email:", warranty["customer_email"]),
        ("Phone:", warranty["customer_phone"]),
    ]
    
    for label, value in details:
        p.setFillColor(HexColor("#A1A1AA"))
        p.drawString(left_margin, y_pos, label)
        p.setFillColor(white)
        p.drawString(left_margin + 120, y_pos, str(value))
        y_pos -= 20
    
    # Vehicle Details
    y_pos -= 20
    p.setFillColor(HexColor("#D4AF37"))
    p.setFont("Helvetica-Bold", 14)
    p.drawString(left_margin, y_pos, "VEHICLE DETAILS")
    
    y_pos -= 25
    p.setFont("Helvetica", 11)
    
    vehicle_details = [
        ("Make:", warranty["vehicle_make"]),
        ("Model:", warranty["vehicle_model"]),
        ("Year:", warranty["vehicle_year"]),
        ("VIN:", warranty.get("vehicle_vin", "N/A")),
        ("Color:", warranty.get("vehicle_color", "N/A")),
    ]
    
    for label, value in vehicle_details:
        p.setFillColor(HexColor("#A1A1AA"))
        p.drawString(left_margin, y_pos, label)
        p.setFillColor(white)
        p.drawString(left_margin + 120, y_pos, str(value) if value else "N/A")
        y_pos -= 20
    
    # PPF Details
    y_pos -= 20
    p.setFillColor(HexColor("#D4AF37"))
    p.setFont("Helvetica-Bold", 14)
    p.drawString(left_margin, y_pos, "PROTECTION DETAILS")
    
    y_pos -= 25
    p.setFont("Helvetica", 11)
    
    ppf_details = [
        ("PPF Product:", warranty["ppf_product"]),
        ("Coverage:", warranty["ppf_coverage"]),
        ("Installation Date:", warranty["installation_date"][:10]),
        ("Warranty Period:", f"{warranty['warranty_years']} Years"),
        ("Expiry Date:", warranty["expiry_date"][:10]),
    ]
    
    for label, value in ppf_details:
        p.setFillColor(HexColor("#A1A1AA"))
        p.drawString(left_margin, y_pos, label)
        p.setFillColor(white)
        p.drawString(left_margin + 120, y_pos, str(value))
        y_pos -= 20
    
    # QR Code
    qr_img_data = base64.b64decode(warranty["qr_code"])
    qr_img = BytesIO(qr_img_data)
    from reportlab.lib.utils import ImageReader
    qr_reader = ImageReader(qr_img)
    p.drawImage(qr_reader, width - 180, 80, width=120, height=120)
    
    p.setFillColor(HexColor("#A1A1AA"))
    p.setFont("Helvetica", 8)
    p.drawCentredString(width - 120, 65, "Scan to verify")
    
    # Footer
    p.setFillColor(HexColor("#52525B"))
    p.setFont("Helvetica", 8)
    p.drawCentredString(width/2, 40, "This certificate is issued by D-Fence, a division of Wheelspa Private Limited")
    
    p.showPage()
    p.save()
    
    buffer.seek(0)
    
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=warranty-{warranty['warranty_code']}.pdf"
        }
    )

# ============== DASHBOARD STATS ==============

@api_router.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    now = datetime.now(timezone.utc)
    
    # Get all warranties
    warranties = await db.warranties.find({}, {"_id": 0, "expiry_date": 1, "created_at": 1}).to_list(10000)
    
    total = len(warranties)
    active = 0
    expiring_soon = 0
    expired = 0
    
    for w in warranties:
        status = get_warranty_status(w["expiry_date"])
        if status == "active":
            active += 1
        elif status == "expiring_soon":
            expiring_soon += 1
        else:
            expired += 1
    
    # Monthly data for last 6 months
    monthly_data = []
    for i in range(5, -1, -1):
        month_start = (now.replace(day=1) - timedelta(days=i*30)).replace(day=1)
        month_end = (month_start + timedelta(days=32)).replace(day=1)
        
        count = sum(1 for w in warranties 
                   if month_start.isoformat() <= w["created_at"] < month_end.isoformat())
        
        monthly_data.append({
            "month": month_start.strftime("%b"),
            "count": count
        })
    
    return DashboardStats(
        total_warranties=total,
        active_warranties=active,
        expiring_soon=expiring_soon,
        expired_warranties=expired,
        monthly_data=monthly_data
    )

# ============== EMAIL SENDING ==============

@api_router.post("/warranties/{warranty_id}/send-email")
async def send_warranty_email(warranty_id: str, current_user: dict = Depends(get_current_user)):
    warranty = await db.warranties.find_one({"id": warranty_id}, {"_id": 0})
    if not warranty:
        raise HTTPException(status_code=404, detail="Warranty not found")
    
    sendgrid_key = os.environ.get('SENDGRID_API_KEY')
    sender_email = os.environ.get('SENDER_EMAIL')
    
    if not sendgrid_key or not sender_email:
        # Return success with mock message if SendGrid not configured
        return {
            "message": "Email functionality not configured. Please set SENDGRID_API_KEY and SENDER_EMAIL.",
            "status": "skipped"
        }
    
    try:
        from sendgrid import SendGridAPIClient
        from sendgrid.helpers.mail import Mail, Attachment, FileContent, FileName, FileType, Disposition
        
        verification_url = f"{os.environ.get('FRONTEND_URL', 'http://localhost:3000')}/verify/{warranty['warranty_code']}"
        
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; background-color: #050505; color: #fff; padding: 40px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #0A0A0A; padding: 40px; border: 1px solid #27272A;">
                <h1 style="color: #D4AF37; text-align: center;">D-FENCE</h1>
                <p style="color: #A1A1AA; text-align: center; margin-bottom: 30px;">by Wheelspa Private Limited</p>
                
                <h2 style="color: #fff;">Your Warranty Certificate</h2>
                
                <p>Dear {warranty['customer_name']},</p>
                
                <p>Thank you for choosing D-Fence Paint Protection Film service. Your warranty has been registered successfully.</p>
                
                <div style="background-color: #121212; padding: 20px; margin: 20px 0; border-left: 3px solid #D4AF37;">
                    <p><strong style="color: #D4AF37;">Warranty Code:</strong> {warranty['warranty_code']}</p>
                    <p><strong style="color: #D4AF37;">Vehicle:</strong> {warranty['vehicle_year']} {warranty['vehicle_make']} {warranty['vehicle_model']}</p>
                    <p><strong style="color: #D4AF37;">PPF Product:</strong> {warranty['ppf_product']}</p>
                    <p><strong style="color: #D4AF37;">Coverage:</strong> {warranty['ppf_coverage']}</p>
                    <p><strong style="color: #D4AF37;">Valid Until:</strong> {warranty['expiry_date'][:10]}</p>
                </div>
                
                <p>You can verify your warranty anytime at:</p>
                <p><a href="{verification_url}" style="color: #00F0FF;">{verification_url}</a></p>
                
                <p style="margin-top: 30px; color: #A1A1AA; font-size: 12px;">
                    This is an automated message from D-Fence Warranty Management System.
                </p>
            </div>
        </body>
        </html>
        """
        
        message = Mail(
            from_email=sender_email,
            to_emails=warranty['customer_email'],
            subject=f"Your D-Fence Warranty Certificate - {warranty['warranty_code']}",
            html_content=html_content
        )
        
        sg = SendGridAPIClient(sendgrid_key)
        response = sg.send(message)
        
        return {"message": "Email sent successfully", "status": "sent"}
    except Exception as e:
        logger.error(f"Failed to send email: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")

# ============== ROOT ROUTE ==============

@api_router.get("/")
async def root():
    return {"message": "D-Fence Warranty Management API", "version": "1.0.0"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
