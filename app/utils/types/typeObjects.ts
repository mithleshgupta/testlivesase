import z from "zod";
import { ObjectId } from ".";

export const CompanyTypeSchema = z.object({
    brand_name: z.string(),
    organization: z.string(),
    gstin: z.string(),
    phone: z.number().max(10),
    email: z.email(),
    address: z.string(),
    password: z.string().min(6, "Password must be at least 6 characters"),
    admin: z.object({
        id: ObjectId,
        ref: "User"
    })
});

export const PermissionsTypeSchema = z.object({
    type: z.string(),
    permissions: z.array(z.string())
});

export const RoleTypeSchema = z.object({
    name: z.string(),
    paths: z.array(z.string()),
    permissions: z.array(z.string()),
    company: z.object({
        id: ObjectId
    }).optional(),
    allowUpdate: z.boolean().optional()
});

export const VendorTypeSchema = z.object({
    company: z.object({
        id: ObjectId,
        ref: "Company"
    }),
    name: z.string(),
    phone: z.number().max(10),
    email: z.email(),
    address: z.string()
});

export const ProductInfoTypeSchema = z.object({
    company: z.object({
        id: ObjectId,
        ref: "Company"
    }),
    vendor: z.object({
        id: ObjectId,
        ref: "Vendor"
    }).optional(),
    name: z.string(),
    description: z.string(),
    sku: z.string(),
    barcode: z.string(),
    barcode_upload: z.string(),
    media: z.array(z.string()),
    price: z.number(),
    cost_price: z.number(),
    quantity: z.number(),
    low_quantity_trigger: z.number(),
    tax_percentage: z.number()
});

export const WarehouseTypeSchema = z.object({
    company: z.object({
        id: ObjectId,
        ref: "Company"
    }),
    name: z.string(),
    media: z.array(z.string()),
    main_person_name: z.string(),
    phone: z.number().max(10),
    email: z.email(),
    address: z.string()
});

export const ZoneTypeSchema = z.object({
    company: z.object({
        id: ObjectId,
        ref: "Company"
    }),
    warehouse: z.object({
        id: ObjectId,
        ref: "Warehouse"
    })
});

export const ProductTypeSchema = z.object({
    epcNumber: z.string(),
    company: {
        id: ObjectId,
        ref: "Company"
    },
    warehouse: {
        id: ObjectId,
        ref: "Warehouse"
    },
    zone: {
        id: ObjectId,
        ref: "Zone"
    },
    productInfo: {
        id: ObjectId,
        ref: "ProductInfo"
    },
});


export const UserTypeSchema = z.object({
    email: z.email(),
    phone: z.number().max(10),
    password: z.string().min(6, "Password must be at least 6 characters"),
    company: z.object({
        id: ObjectId,
        ref: "Company"
    }),
    branch: z.object({
        id: ObjectId,
        refPath: 'branchPath'
    }),
    branchPath: z.enum(["Warehouse", "Company"]),
    role: z.string()
});

export const AuditTypeSchema = z.object({
    uuid: z.string(),
    company: z.object({
        id: ObjectId,
        ref: "Company"
    }),
    warehouse: z.object({
        id: ObjectId,
        ref: "Warehouse"
    }),
    epcNumber: z.array(z.string())
});

export const ShipmentTypeSchema = z.object({
    company: z.object({
        id: ObjectId,
        ref: "Company"
    }),
    warehouse: z.object({
        id: ObjectId,
        ref: "Warehouse"
    }),
    destinationWarehouse: z.object({
        id: ObjectId,
        ref: "Warehouse"
    }),
    status: z.enum(["ready to ship", "outbound", "inbound", "completed"]),
    schedule: z.date(),
    manager: z.string(),
    manager_at_destination: z.string()
});

export const ShipmentProductTypeSchema = z.object({
    epcNumber: z.string(),
    shipment: z.object({
        id: ObjectId,
        ref: "Shipment"
    })
});