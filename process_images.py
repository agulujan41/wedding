from PIL import Image, ImageChops

def trim(im):
    bg = Image.new(im.mode, im.size, (255, 255, 255, 0))
    diff = ImageChops.difference(im, bg)
    diff = ImageChops.add(diff, diff, 2.0, -100)
    bbox = diff.getbbox()
    if bbox:
        return im.crop(bbox)
    return im

def remove_white_background(img_path, output_path):
    img = Image.open(img_path).convert("RGBA")
    datas = img.getdata()

    newData = []
    for item in datas:
        # If the pixel is close to white, make it transparent
        if item[0] > 245 and item[1] > 245 and item[2] > 245:
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item)

    img.putdata(newData)
    
    # Now trim the empty space
    trimmed_img = trim(img)
    trimmed_img.save(output_path, "PNG")
    print(f"Processed {img_path} -> {output_path}")

if __name__ == "__main__":
    remove_white_background("image/letter.png", "image/letter.png")
    remove_white_background("image/sello.png", "image/sello.png")
