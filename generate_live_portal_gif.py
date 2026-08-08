import os
from PIL import Image, ImageDraw, ImageFont

def generate_live_portal_gif():
    base_dir = os.path.dirname(__file__)
    patient_shot_path = os.path.join(base_dir, "shot_patient.png")
    doctor_shot_path = os.path.join(base_dir, "shot_doctor.png")
    reception_shot_path = os.path.join(base_dir, "shot_reception.png")

    frames = []

    # Try loading captured screenshots
    try:
        img_patient = Image.open(patient_shot_path).convert("RGB")
        img_doctor = Image.open(doctor_shot_path).convert("RGB")
        img_reception = Image.open(reception_shot_path).convert("RGB")
    except Exception as e:
        print(f"Error loading screenshots: {e}")
        return

    # Resize to standard 1280x800
    target_size = (1280, 800)
    img_patient = img_patient.resize(target_size, Image.Resampling.LANCZOS)
    img_doctor = img_doctor.resize(target_size, Image.Resampling.LANCZOS)
    img_reception = img_reception.resize(target_size, Image.Resampling.LANCZOS)

    # Add overlay banner to each frame
    def add_banner(img, portal_name, color):
        annotated = img.copy()
        draw = ImageDraw.Draw(annotated)
        try:
            font = ImageFont.truetype("arial.ttf", 22)
            small_font = ImageFont.truetype("arial.ttf", 14)
        except:
            font = small_font = ImageFont.load_default()

        # Top Banner Overlay
        draw.rectangle([0, 0, 1280, 50], fill=(15, 23, 42))
        draw.rectangle([0, 47, 1280, 50], fill=color)
        draw.text((30, 12), f"LIVE WORKING DEMO: {portal_name}", fill=(255, 255, 255), font=font)
        draw.text((1280 - 380, 15), "VITAMIND • Team HACKERZ (CIT)", fill=color, font=small_font)
        return annotated

    frame1 = add_banner(img_patient, "👤 PATIENT PORTAL (Saffron Theme + Voice AI Agent)", (234, 88, 12))
    frame2 = add_banner(img_doctor, "👨‍⚕️ DOCTOR CLINICAL PORTAL (Sky Blue Theme + OPD Queue #A-15)", (2, 132, 199))
    frame3 = add_banner(img_reception, "🏥 RECEPTION CONSOLE (Sky Pink Theme + Optical QR & Cashless CMCHIS)", (219, 39, 119))

    # Add each frame multiple times to pause 3 seconds per portal frame
    for f in [frame1, frame1, frame1, frame2, frame2, frame2, frame3, frame3, frame3]:
        frames.append(f)

    out_gif = os.path.join(base_dir, "vitamind_live_portal_walkthrough.gif")
    downloads_gif = os.path.expanduser("~/Downloads/vitamind_live_portal_walkthrough.gif")

    frames[0].save(out_gif, save_all=True, append_images=frames[1:], duration=1500, loop=0)
    frames[0].save(downloads_gif, save_all=True, append_images=frames[1:], duration=1500, loop=0)

    print("Live working portal demo GIF generated successfully!")

if __name__ == "__main__":
    generate_live_portal_gif()
