// ─── Field configs (map 1-to-1 with vendor schema) ───────────────────────────

export const BUSINESS_FIELDS = [
  {
    key: "businessName",
    label: "Business Name",
    placeholder: "e.g. Sharma Traders",
  },
  {
    key: "businessType",
    label: "Business Type",
    placeholder: "e.g. Retail, Wholesale",
  },
  {
    key: "gstNumber",
    label: "GST Number",
    placeholder: "22AAAAA0000A1Z5",
    caps: true,
  },
  {
    key: "panNumber",
    label: "PAN Number",
    placeholder: "ABCDE1234F",
    caps: true,
  },
  {
    key: "businessEmail",
    label: "Business Email",
    placeholder: "business@email.com",
    keyboard: "email-address",
  },
  {
    key: "businessPhone",
    label: "Business Phone",
    placeholder: "+91 98765 43210",
    keyboard: "phone-pad",
  },
  {
    key: "yearEstablished",
    label: "Year Established",
    placeholder: "2010",
    keyboard: "numeric",
  },
  {
    key: "numberOfEmployees",
    label: "No. of Employees",
    placeholder: "25",
    keyboard: "numeric",
  },
  {
    key: "retailChannel",
    label: "Retail Channel",
    placeholder: "e.g. Online, Offline",
  },
];

export const SELLER_FIELDS = [
  { key: "sellerName", label: "Seller Name", placeholder: "Full legal name" },
  {
    key: "sellerEmail",
    label: "Seller Email",
    placeholder: "seller@email.com",
    keyboard: "email-address",
  },
  {
    key: "sellerPhone",
    label: "Seller Phone",
    placeholder: "+91 98765 43210",
    keyboard: "phone-pad",
  },
  {
    key: "address",
    label: "Address",
    placeholder: "Street / locality",
    multiline: true,
  },
  { key: "city", label: "City", placeholder: "Delhi" },
  { key: "state", label: "State", placeholder: "Delhi" },
  {
    key: "pincode",
    label: "Pincode",
    placeholder: "110001",
    keyboard: "numeric",
  },
];

export const BRAND_FIELDS = [
  { key: "brandName", label: "Brand Name", placeholder: "Your brand" },
  {
    key: "brandType",
    label: "Brand Type",
    placeholder: "e.g. FMCG, Electronics",
  },
  {
    key: "trademarkNumber",
    label: "Trademark Number",
    placeholder: "TM-XXXXXX",
  },
  {
    key: "brandWebsite",
    label: "Brand Website",
    placeholder: "https://yourbrand.com",
    keyboard: "url",
  },
];

export const BANK_FIELDS = [
  {
    key: "accountHolderName",
    label: "Account Holder Name",
    placeholder: "As per bank records",
  },
  {
    key: "accountNumber",
    label: "Account Number",
    placeholder: "XXXXXXXXXXXXXXXX",
    keyboard: "numeric",
    secure: true,
  },
  {
    key: "ifscCode",
    label: "IFSC Code",
    placeholder: "SBIN0001234",
    caps: true,
  },
  { key: "bankName", label: "Bank Name", placeholder: "State Bank of India" },
  { key: "branch", label: "Branch", placeholder: "Connaught Place, Delhi" },
];

export const SHIPPING_FIELDS = [
  {
    key: "warehouseAddress",
    label: "Warehouse Address",
    placeholder: "Street / Plot no.",
    multiline: true,
  },
  { key: "city", label: "City", placeholder: "Delhi" },
  { key: "state", label: "State", placeholder: "Delhi" },
  {
    key: "pincode",
    label: "Pincode",
    placeholder: "110001",
    keyboard: "numeric",
  },
  {
    key: "latitude",
    label: "Latitude",
    placeholder: "28.6139",
    keyboard: "numeric",
  },
  {
    key: "longitude",
    label: "Longitude",
    placeholder: "77.2090",
    keyboard: "numeric",
  },
];

export const KYC_DOCUMENTS = [
  {
    key: "aadhaar",
    label: "Aadhaar Card",
    icon: "card-account-details-outline",
    hint: "Front side · Clear & unobstructed",
  },
  {
    key: "drivingLicence",
    label: "Driving Licence",
    icon: "car-outline",
    hint: "Front side · All details visible",
  },
];

export const SECTIONS = [
  { key: "business", label: "Business Details", icon: "storefront-outline" },
  { key: "seller", label: "Seller Details", icon: "person-outline" },
  { key: "brand", label: "Brand Details", icon: "ribbon-outline" },
  { key: "bank", label: "Bank Details", icon: "card-outline" },
  { key: "shipping", label: "Shipping / Warehouse", icon: "cube-outline" },
  { key: "kyc", label: "KYC & Identity", icon: "shield-checkmark-outline" },
  { key: "signature", label: "Digital Signature", icon: "create-outline" },
];
