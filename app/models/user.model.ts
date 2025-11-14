import { IUser } from "../utils/types/interfaces";
import mongoose, { Model, Schema, Types } from "mongoose";
import { hashPassword } from "../utils/helpers";

const UserSchema = new Schema<IUser>(
    {
        email: {
            type: String,
            required: true,
            unique: true
        },
        phone: {
            type: Number,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true,
            set: (val: string) => hashPassword(val)
        },
        company: {
            type: Types.ObjectId,
            ref: "Company",
            required: true
        },
        branch: {
            type: Types.ObjectId,
            refPath: 'branchRef'
        },
        branchPath: {
            type: String,
            enum: ['Warehouse', 'Company']
        },
        role: {
            type: String,
            default: "user"
        }
    },
    {
        timestamps: true
    }
);

interface IUserModel extends Model<IUser> {
    get: (
        matchConditions: Record<string, any>,
        filters: any[]
    ) => Promise<any[]>;
};

UserSchema.statics.get = async function (
    matchConditions: Record<string, any> = {},
    filters: any[] = []
) {
    const pipeline = [
        {
            $match: matchConditions
        },
        ...filters,
        {
            $project: {
                password: 0
            }
        }
    ];

    const result = await this.aggregate(pipeline);

    return result || [];
}



export const User = mongoose.model<IUser, IUserModel>("User", UserSchema);