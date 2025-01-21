export function fileChecker(file) {
  const validTypes = ["image/png", "image/jpeg", "image/jpg"];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  // Check for valid file type
  if (file && !validTypes.includes(file.type)) {
    return { valid: false, error: "Only .png, .jpg, or .jpeg files are allowed." };
  }
  
  // Check for valid file size
  if (file && file.size > maxSize) {
    return { valid: false, error: "File size must be less than 5MB." };
  }
  
  return { valid: true };
}
