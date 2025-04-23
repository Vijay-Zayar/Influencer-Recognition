import os
import cv2

def rotate_and_save_images(input_dir, angle=90):
    """
    Rotates all images in a directory by `angle` degrees and saves them.
    
    Args:
        input_dir (str): Path to the directory containing images.
        angle (int): Rotation angle in degrees (90, 180, 270).
    """
    # Supported image extensions
    valid_extensions = ('.jpg', '.jpeg', '.png', '.bmp', '.tiff')
    
    # Loop through all files in the directory
    for filename in os.listdir(input_dir):
        if filename.lower().endswith(valid_extensions):
            # Read the image
            img_path = os.path.join(input_dir, filename)
            img = cv2.imread(img_path)
            
            if img is not None:
                # Rotate the image
                height, width = img.shape[:2]
                rotation_matrix = cv2.getRotationMatrix2D((width/2, height/2), angle, 1)
                rotated_img = cv2.warpAffine(img, rotation_matrix, (width, height))
                
                # Save the rotated image
                name, ext = os.path.splitext(filename)
                output_path = os.path.join(input_dir, f"{name}_rotated{ext}")
                cv2.imwrite(output_path, rotated_img)
                print(f"Saved: {output_path}")
            else:
                print(f"Failed to load: {filename}")

# Example usage
folders = ["elonmusk","jackma","ronaldo","shakira"]
for folder in folders:
    rotate_and_save_images(input_dir=f"./{folder}", angle=90)
