import { IProduct } from "../utils/types/interfaces";
import mongoose, { Model, PipelineStage, Schema, Types } from "mongoose";

const ProductSchema = new Schema<IProduct>(
    {
        epcNumber: {
            type: String,
            required: true
        },
        company: {
            type: Types.ObjectId,
            ref: "Company",
            required: true
        },
        warehouse: {
            type: Types.ObjectId,
            ref: "Warehouse",
            required: true
        },
        zone: {
            type: Types.ObjectId,
            ref: "Zone",
            required: true
        },
        productInfo: {
            type: Types.ObjectId,
            ref: "ProductInfo",
            required: true
        }
    },
    {
        timestamps: true
    }
);

interface IProductModel extends Model<IProduct> {
    get: (
        matchConditions: Record<string, any>,
        filters: any[]
    ) => Promise<any[]>,
    checkEPCs: (
        epcs: string[],
        matchConditions?: Record<string, any>
    ) => Promise<{
        found: {
            epcs: string[],
            count: number
        },
        notFound: {
            epcs: string[],
            count: number
        }
    }>
}

ProductSchema.statics.get = async function (
    matchConditions: Record<string, any> = {},
    filters: any[] = []
) {
    const pipeline = [
        {
            $match: matchConditions
        },
        ...filters,
        {
            $lookup: {
                from: "productinfos",
                localField: "productInfo",
                foreignField: "_id",
                as: "productInfo",
                pipeline: [
                    {
                        $project: {
                            company: 0
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$productInfo"
        },
        {
            $project: {
                _id: 0,
            }
        }
    ];

    const result = await this.aggregate(pipeline);

    return result || [];
}

ProductSchema.statics.checkEPCs = async function (
    epcs: string[],
    matchConditions: Record<string, any> = {}
) {
    const results = await this.aggregate([
        {
            $facet: {
                found: [
                    {
                        $match: {
                            epcNumber: { $in: epcs },
                            ...matchConditions
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            epcs: { $addToSet: "$epcNumber" }
                        }
                    }
                ]
            }
        },
        {
            $project: {
                foundEPCs: {
                    $ifNull: [{ $arrayElemAt: ["$found.epcs", 0] }, []]
                }
            }
        },
        {
            $addFields: {
                notFoundEPCs: {
                    $setDifference: [epcs, "$foundEPCs"]
                }
            }
        },
        {
            $project: {
                found: {
                    epcs: "$foundEPCs",
                    count: { $size: "$foundEPCs" }
                },
                notFound: {
                    epcs: "$notFoundEPCs",
                    count: { $size: "$notFoundEPCs" }
                }
            }
        }
    ]);

    return results[0] ?? {
        found: {
            epcs: [],
            count: 0
        },
        notFound: {
            epcs: epcs,
            count: epcs.length
        }
    };
};


export const Product = mongoose.model<IProduct, IProductModel>("Product", ProductSchema);