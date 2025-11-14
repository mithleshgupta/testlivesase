import z from "zod";
import {
    CompanyTypeSchema,
    PermissionsTypeSchema,
    ProductInfoTypeSchema,
    RoleTypeSchema,
    UserTypeSchema,
    WarehouseTypeSchema,
    ZoneTypeSchema,
    ProductTypeSchema,
    VendorTypeSchema,
    AuditTypeSchema,
    ShipmentProductTypeSchema,
    ShipmentTypeSchema,
} from "./typeObjects";

export interface ICompany extends z.infer<typeof CompanyTypeSchema>, Document { };

export interface IPermissions extends z.infer<typeof PermissionsTypeSchema>, Document { };

export interface IRole extends z.infer<typeof RoleTypeSchema>, Document { };

export interface IVendor extends z.infer<typeof VendorTypeSchema>, Document { };

export interface IProductInfo extends z.infer<typeof ProductInfoTypeSchema>, Document { };

export interface IWarehouse extends z.infer<typeof WarehouseTypeSchema>, Document { };

export interface IZone extends z.infer<typeof ZoneTypeSchema>, Document { };

export interface IProduct extends z.infer<typeof ProductTypeSchema>, Document { };

export interface IUser extends z.infer<typeof UserTypeSchema>, Document { };

export interface IAudit extends z.infer<typeof AuditTypeSchema>, Document { };

export interface IShipment extends z.infer<typeof ShipmentTypeSchema>, Document { };

export interface IShipmentProduct extends z.infer<typeof ShipmentProductTypeSchema>, Document { };