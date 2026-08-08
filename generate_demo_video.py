import os
from PIL import Image, ImageDraw, ImageFont

def create_demo_gif():
    width, height = 1280, 720
    frames = []

    # Colors
    bg_dark = (15, 23, 42)
    saffron_orange = (234, 88, 12)
    sky_blue = (2, 132, 199)
    sky_pink = (219, 39, 119)
    green_accent = (34, 197, 94)
    white = (255, 255, 255)
    gray_bg = (248, 250, 252)

    # Try loading font or default
    try:
        title_font = ImageFont.truetype("arial.ttf", 36)
        heading_font = ImageFont.truetype("arial.ttf", 26)
        body_font = ImageFont.truetype("arial.ttf", 18)
        small_font = ImageFont.truetype("arial.ttf", 14)
    except:
        title_font = heading_font = body_font = small_font = ImageFont.load_default()

    slides_data = [
        {
            "title": "VITAMIND — AGENTIC AI HEALTHCARE PLATFORM",
            "subtitle": "PRISM Hackathon Theme 1 Project Demo Walkthrough",
            "tag": "TEAM HACKERZ • CHENNAI INSTITUTE OF TECHNOLOGY",
            "accent": saffron_orange,
            "items": [
                "👤 Patient Health Portal (Saffron Theme + Voice AI Agent)",
                "👨‍⚕️ Doctor OPD Command Station (Sky Blue Theme + E-Prescriptions)",
                "🏥 Hospital Reception Console (Sky Pink Theme + Optical QR Scanner)"
            ]
        },
        {
            "title": "👤 PATIENT PORTAL — VOICE & TEXT AI ASSISTANT",
            "subtitle": "Autonomous Live Form Detail Autofilling",
            "tag": "LIVE DEMO • PATIENT PORTAL",
            "accent": saffron_orange,
            "items": [
                "🎙️ Spoken Input: 'My name is Ramesh, phone 9840011223, high fever, book RGGGH'",
                "✍️ Agent Action: Auto-fills Name, Phone, Symptoms, Hospital & Doctor live on screen",
                "🎫 QR Token Issued: Token #A-15 assigned for Pediatrics OPD Room 4"
            ]
        },
        {
            "title": "👨‍⚕️ DOCTOR PORTAL — OPD QUEUE & E-PRESCRIPTION DESK",
            "subtitle": "Real-Time OPD Queue Control & Saved Records Vault",
            "tag": "LIVE DEMO • DOCTOR PORTAL",
            "accent": sky_blue,
            "items": [
                "📢 OPD Queue Action: Clicked 'Call Next Token #A-15' into Doctor Room 4",
                "📂 Saved Medical Records Tab: View past patient PDFs, X-rays & blood test scans",
                "📄 E-Prescription Desk: Issued Dolo 650mg & Cetirizine with digital signature"
            ]
        },
        {
            "title": "🏥 RECEPTION CONSOLE — OPTICAL QR SCAN & CASHLESS BILLING",
            "subtitle": "Zero-Wait Queue Admission & CMCHIS Insurance Pre-Authorization",
            "tag": "LIVE DEMO • RECEPTION CONSOLE",
            "accent": sky_pink,
            "items": [
                "🔍 Optical QR Scan: Scanned Token #A-15 for instant 3-second OPD admission",
                "💳 Cashless Billing Calculator: Computed CMCHIS insurance discount (-₹1,50,000)",
                "🚑 108 Emergency Telematics: Live GPS tracking for incoming ICU ambulances"
            ]
        },
        {
            "title": "📡 REAL-TIME WEBSOCKET MESH & CONCLUSION",
            "subtitle": "All 3 Portals Synchronized Live with Sub-10ms Latency",
            "tag": "SUBMISSION READY • PRISM HACKATHON",
            "accent": green_accent,
            "items": [
                "🌐 Live Web App: https://hariss0606.github.io/vitamind-healthcare/",
                "📁 GitHub Repo: https://github.com/HARISS0606/vitamind-healthcare",
                "📄 Submission Presentation PDF: HACKERZ_PRISM_Presentation.pdf"
            ]
        }
    ]

    for slide in slides_data:
        # Create 3 animation sub-frames per slide for smooth video effect
        for step in range(3):
            img = Image.new("RGB", (width, height), bg_dark)
            draw = ImageDraw.Draw(img)

            # Top Header Bar
            draw.rectangle([0, 0, width, 80], fill=(30, 41, 59))
            draw.rectangle([0, 77, width, 80], fill=slide["accent"])
            draw.text((40, 22), slide["title"], fill=white, font=heading_font)

            # Tag Badge
            draw.rectangle([width - 450, 24, width - 40, 56], fill=slide["accent"])
            draw.text((width - 435, 30), slide["tag"], fill=white, font=small_font)

            # Card Container
            draw.rectangle([60, 120, width - 60, height - 100], fill=gray_bg)

            # Subtitle
            draw.text((100, 150), slide["subtitle"], fill=slide["accent"], font=title_font)
            draw.line([100, 210, width - 100, 210], fill=(203, 213, 225), width=2)

            # Bullet Items
            y_offset = 240
            for idx, item in enumerate(slide["items"]):
                if idx <= step:
                    # Item Box
                    draw.rectangle([100, y_offset, width - 100, y_offset + 80], fill=white, outline=(226, 232, 240), width=2)
                    draw.rectangle([100, y_offset, 110, y_offset + 80], fill=slide["accent"])
                    draw.text((130, y_offset + 25), item, fill=(15, 23, 42), font=body_font)
                y_offset += 100

            # Footer
            draw.rectangle([0, height - 60, width, height], fill=(15, 23, 42))
            draw.text((40, height - 40), "VITAMIND Healthcare Platform — Team HACKERZ (3rd Year CSE, CIT)", fill=(148, 163, 184), font=small_font)
            draw.text((width - 320, height - 40), "Theme 1: Autonomous AI Agents", fill=slide["accent"], font=small_font)

            frames.append(img)

    # Save as animated GIF / Demo Video
    output_gif = os.path.join(os.path.dirname(__file__), "vitamind_demo_video.gif")
    downloads_gif = os.path.expanduser("~/Downloads/vitamind_demo_video.gif")

    frames[0].save(output_gif, save_all=True, append_images=frames[1:], duration=1200, loop=0)
    frames[0].save(downloads_gif, save_all=True, append_images=frames[1:], duration=1200, loop=0)

    print(f"Demo Video GIF generated at: {output_gif}")
    print(f"Demo Video GIF saved to Downloads: {downloads_gif}")

if __name__ == "__main__":
    create_demo_gif()
