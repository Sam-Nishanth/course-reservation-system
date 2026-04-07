# Online Course Reservation System

## Environment Variables

Create a file at [backend/.env](D:\SAM\course-reservation-system\backend\.env) with:

```env
XAI_API_KEY=your_xai_api_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

Optional backend settings:

```env
DATABASE_URL=
SECRET_KEY=
JWT_SECRET_KEY=
XAI_MODEL=grok-3-mini
```

The backend loads `.env` automatically with `python-dotenv`. Razorpay and xAI keys are read only on the backend and are never exposed to the frontend.

If a required key is missing when a protected integration is used, the backend raises a clear error like:

```text
Missing environment variable: XAI_API_KEY
```

## Run Backend

```powershell
cd D:\SAM\course-reservation-system\backend
.\venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

## Run Frontend

```powershell
cd D:\SAM\course-reservation-system\frontend
npm install
npm start
```

## Notes

- Keep [backend/.env](D:\SAM\course-reservation-system\backend\.env) private.
- Do not put Razorpay or xAI secrets into React code.
- The project already uses backend-only service calls for Razorpay and xAI.
