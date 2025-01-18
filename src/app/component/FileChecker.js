export function fileChecker(file) {
    const validTypes = ["image/png", "image/jpeg", "image/jpg"];
    const maxSize = 5 * 1024 * 1024; // 5MB
  
    if (!validTypes.includes(file.type)) {
      throw new Error("Only .png, .jpg, or .jpeg files are allowed.");
    }
    if (file.size > maxSize) {
      throw new Error("File size must be less than 5MB.");
    }
  }
  