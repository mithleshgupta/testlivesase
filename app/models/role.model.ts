import { IRole } from "../utils/types/interfaces";
import mongoose, { Model, Schema, Types } from "mongoose";

const RoleSchema = new Schema<IRole>(
    {
        company: {
            type: Types.ObjectId,
            ref: "Company"
        },
        name: {
            type: String,
            required: true
        },
        paths: {
            type: [String],
            required: true,
            default: []
        },
        permissions: {
            type: [String],
            required: true,
            default: []
        },
        allowUpdate: {
            type: Boolean,
            required: true,
            default: false
        }
    },
    {
        timestamps: true
    }
);

interface IRoleModel extends Model<IRole> {
    get: (
        matchConditions: Record<string, any>,
        filters: any[]
    ) => Promise<any[]>;
    defaultRoles: () => Promise<IRole>;
};

RoleSchema.statics.get = async function (
    matchConditions: Record<string, any> = {},
    filters: any[] = []
) {
    const pipeline = [
        {
            $match: matchConditions
        },
        ...filters
    ];

    const result = await this.aggregate(pipeline);

    return result || [];
}

RoleSchema.statics.defaultRoles = async function () {

    const defaultRole = await this.findOne({ name: "default" });

    if (!defaultRole) {
        throw new Error("Error while creating default roles");
    }

    const roleData = defaultRole.toObject();
    delete roleData._id;

    const newRole = await this.create(roleData);

    return newRole;

}

export const Role = mongoose.model<IRole, IRoleModel>("Role", RoleSchema);