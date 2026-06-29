export const toSlug = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");

export function validateForm({ images, basic, category, pricing, inventory }) {
  const errs = {};
  if (images.length === 0) errs.images = "At least one image is required";
  if (!basic.name.trim()) errs.name = "Product name is required";
  if (!basic.description.trim()) errs.description = "Description is required";
  if (!category.category) errs.category = "Select a category";
  if (!category.subCategory) errs.subCategory = "Select a sub-category";
  if (!pricing.mrp || isNaN(Number(pricing.mrp)) || Number(pricing.mrp) <= 0)
    errs.mrp = "Valid MRP is required";
  if (
    !pricing.price ||
    isNaN(Number(pricing.price)) ||
    Number(pricing.price) <= 0
  )
    errs.price = "Valid selling price is required";
  if (Number(pricing.price) > Number(pricing.mrp))
    errs.price = "Selling price cannot exceed MRP";
  if (!inventory.stock || isNaN(Number(inventory.stock)))
    errs.stock = "Stock quantity is required";
  return errs;
}
