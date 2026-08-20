import math
import random
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter

def draw_star(draw, cx, cy, size, color):
    points = []
    for i in range(8):
        r = size if i % 2 == 0 else size * 0.4
        angle = i * math.pi / 4
        points.append((cx + r * math.cos(angle), cy + r * math.sin(angle)))
    draw.polygon(points, fill=color)

def draw_sparkle(draw, cx, cy, size, color):
    # 4-point star
    draw.line([(cx - size, cy), (cx + size, cy)], fill=color, width=2)
    draw.line([(cx, cy - size), (cx, cy + size)], fill=color, width=2)
    # central dot
    draw.ellipse([cx - size*0.3, cy - size*0.3, cx + size*0.3, cy + size*0.3], fill=color)

def generate_celebrating_gif():
    base_img = Image.open("public/assets/mascot_celebrating_base.jpg").convert("RGBA")
    w, h = base_img.size
    
    # Target size
    out_w, out_h = 512, 512
    base_img = base_img.resize((out_w, out_h), Image.Resampling.LANCZOS)
    
    num_frames = 24
    frames = []
    
    # Seeded particles for deterministic loop
    random.seed(42)
    particles = []
    for i in range(25):
        particles.append({
            'x': random.uniform(40, out_w - 40),
            'y_base': random.uniform(30, out_h - 60),
            'speed': random.uniform(30, 70),
            'size': random.uniform(4, 10),
            'phase': random.uniform(0, math.pi * 2),
            'type': random.choice(['star', 'sparkle', 'dot']),
            'color': random.choice([
                (229, 193, 88, 240), # Gold
                (245, 215, 120, 255), # Bright Yellow
                (255, 240, 180, 240), # Pale Gold
                (59, 130, 246, 200),  # Blue
                (244, 63, 94, 200),   # Rose
            ])
        })
        
    for frame_idx in range(num_frames):
        t = frame_idx / num_frames
        angle_rad = t * 2 * math.pi
        
        # Hopping and squash/stretch
        jump_y = -18 * math.sin(angle_rad)
        rot_deg = 2.5 * math.sin(angle_rad)
        scale_x = 1.0 - 0.03 * math.cos(angle_rad)
        scale_y = 1.0 + 0.04 * math.cos(angle_rad)
        
        # Transform base character
        cur_w = int(out_w * scale_x)
        cur_h = int(out_h * scale_y)
        scaled = base_img.resize((cur_w, cur_h), Image.Resampling.BICUBIC)
        rotated = scaled.rotate(rot_deg, resample=Image.Resampling.BICUBIC, expand=True)
        
        # Create canvas with white background
        canvas = Image.new("RGBA", (out_w, out_h), (253, 251, 247, 255))
        draw = ImageDraw.Draw(canvas)
        
        # Paste Shep centered with jump offset
        rw, rh = rotated.size
        pos_x = (out_w - rw) // 2
        pos_y = (out_h - rh) // 2 + int(jump_y)
        
        # Alpha composite Shep
        canvas.paste(rotated, (pos_x, pos_y), rotated)
        
        # Render sparkling floating particles over and around Shep
        draw = ImageDraw.Draw(canvas)
        for p in particles:
            # Loop particle position
            py = (p['y_base'] - p['speed'] * t) % (out_h - 40) + 20
            px = p['x'] + 8 * math.sin(angle_rad + p['phase'])
            pulse = 0.5 + 0.5 * math.sin(angle_rad * 2 + p['phase'])
            cur_size = p['size'] * (0.7 + 0.5 * pulse)
            
            c = p['color']
            if p['type'] == 'star':
                draw_star(draw, px, py, cur_size, c)
            elif p['type'] == 'sparkle':
                draw_sparkle(draw, px, py, cur_size, c)
            else:
                draw.ellipse([px - cur_size/2, py - cur_size/2, px + cur_size/2, py + cur_size/2], fill=c)
                
        # Convert to RGB (GIF compatible)
        rgb_frame = canvas.convert("RGB")
        frames.append(rgb_frame)
        
    frames[0].save(
        "public/assets/mascot_celebrating.gif",
        save_all=True,
        append_images=frames[1:],
        duration=50,
        loop=0,
        optimize=True
    )
    print("mascot_celebrating.gif created successfully!")

def generate_study_gif():
    base_img = Image.open("public/assets/mascot_study_base.jpg").convert("RGBA")
    w, h = base_img.size
    
    out_w, out_h = 512, 512
    base_img = base_img.resize((out_w, out_h), Image.Resampling.LANCZOS)
    
    num_frames = 24
    frames = []
    
    random.seed(99)
    holy_particles = []
    for i in range(18):
        holy_particles.append({
            'x_offset': random.uniform(-100, 100),
            'y_base': random.uniform(320, 460),
            'speed': random.uniform(25, 55),
            'size': random.uniform(3, 8),
            'phase': random.uniform(0, math.pi * 2),
            'color': random.choice([
                (229, 193, 88, 230),
                (255, 230, 130, 255),
                (255, 255, 220, 220),
            ])
        })
        
    for frame_idx in range(num_frames):
        t = frame_idx / num_frames
        angle_rad = t * 2 * math.pi
        
        # Gentle breathing and slight head nodding
        nod_y = -6 * math.sin(angle_rad)
        rot_deg = 0.8 * math.sin(angle_rad)
        scale_x = 1.0 + 0.012 * math.sin(angle_rad)
        scale_y = 1.0 - 0.01 * math.sin(angle_rad)
        
        cur_w = int(out_w * scale_x)
        cur_h = int(out_h * scale_y)
        scaled = base_img.resize((cur_w, cur_h), Image.Resampling.BICUBIC)
        rotated = scaled.rotate(rot_deg, resample=Image.Resampling.BICUBIC, expand=True)
        
        canvas = Image.new("RGBA", (out_w, out_h), (253, 251, 247, 255))
        
        rw, rh = rotated.size
        pos_x = (out_w - rw) // 2
        pos_y = (out_h - rh) // 2 + int(nod_y)
        
        canvas.paste(rotated, (pos_x, pos_y), rotated)
        
        # Add holy aura glow around Bible (center ~256, 360)
        draw = ImageDraw.Draw(canvas)
        aura_pulse = 0.6 + 0.4 * math.sin(angle_rad)
        aura_r = int(60 + 20 * aura_pulse)
        bible_cx, bible_cy = 256, 360 + int(nod_y)
        
        # Floating holy wisdom particles rising from Bible
        for p in holy_particles:
            py = (p['y_base'] - p['speed'] * t) % (300) + 120
            px = bible_cx + p['x_offset'] + 6 * math.sin(angle_rad + p['phase'])
            pulse = 0.5 + 0.5 * math.sin(angle_rad * 2 + p['phase'])
            cur_size = p['size'] * (0.6 + 0.4 * pulse)
            c = p['color']
            
            draw_sparkle(draw, px, py, cur_size, c)
            
        rgb_frame = canvas.convert("RGB")
        frames.append(rgb_frame)
        
    frames[0].save(
        "public/assets/mascot_study.gif",
        save_all=True,
        append_images=frames[1:],
        duration=70,
        loop=0,
        optimize=True
    )
    print("mascot_study.gif created successfully!")

if __name__ == "__main__":
    generate_celebrating_gif()
    generate_study_gif()
