import { IAudit } from "../utils/types/interfaces";
import mongoose, { Model, Schema, Types } from "mongoose";

const AuditSchema = new Schema<IAudit>(
    {
        uuid: {
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
        epcNumber: {
            type: [String],
            required: true
        }
    }
);

interface IAuditModel extends Model<IAudit> {
    scan: (
        uuid: string,
        companyId: string,
        scanEpcNumbers: string[]
    ) => Promise<Record<string, any>>
};

AuditSchema.statics.scan = async function (
    uuid: string,
    companyId: string,
    scanEpcNumbers: string[]
) {
    const pipeline = [
        {
            $match: {
                uuid,
                "company.id": new Types.ObjectId(companyId),
            },
        },
        {
            $lookup: {
                from: "product",
                let: { epc: "$epcNumber" },
                pipeline: [
                    {
                        $match: {
                            $in: ["$product.epcNumber", "$$epc"],
                        }
                    },
                    {
                        $match: {

                        }
                    }
                ],
                as: "product"
            }
        },
        {
            $project: {
                _id: 0,
                epcNumber: 1,
                product: 1
            }
        },
        {
            $group: {
                _id: null,
                products: { $push: "$product" }
            }
        },
        {
            $lookup: {
                from: "product",
                localField: "staged_epcNumbers",
                foreignField: "product.epcNumber",
                as: "product"
            }
        },
        {
            $addFields: {
                scanEpcNumbers
            }
        },
        {
            $project: {
                scanEpcNumbers: 1,
                staged_epcNumbers: 1,
                foundEpcs: {
                    $setIntersection: ["$scanEpcNumbers", "$staged_epcNumbers"]
                },
                unknownInScan: {
                    $setDifference: ["$scanEpcNumbers", "$staged_epcNumbers"]
                },
                unknownInStage: {
                    $setDifference: ["$staged_epcNumbers", "$scanEpcNumbers"]
                },
                foundEpcsCount: {
                    $size: "$foundEpcs"
                },
                unknownInScanCount: {
                    $size: "$unknownInScan"
                },
                unknownInStageCount: {
                    $size: "$unknownInStage"
                }
            }
        },
        {
            $lookup: {
                from: "product",
                localField: "scanEpcNumbers",
                foreignField: "product.epcNumber",
                as: "product",
                pipeline: [
                    {
                        $lookup: {
                            from: "productInfo",
                            localField: "productInfo.id",
                            foreignField: "_id",
                            as: "productInfo",
                            pipeline: [
                                {
                                    $lookup: {
                                        from: "vendor",
                                        localField: "vendor.id",
                                        foreignField: "_id",
                                        as: "vendor",
                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$vendor",
                                        preserveNullAndEmptyArrays: true
                                    }
                                },
                                {
                                    $project: {
                                        _id: 0
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $lookup: {
                            from: "warehouse",
                            localField: "warehouse.id",
                            foreignField: "_id",
                            as: "warehouse"
                        }
                    },
                    {
                        $unwind: {
                            path: "$warehouse",
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $lookup: {
                            from: "zone",
                            localField: "zone.id",
                            foreignField: "_id",
                            as: "zone"
                        }
                    },
                    {
                        $unwind: {
                            path: "$zone",
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $project: {
                            company: 0
                        }
                    }
                ]
            },
        },
        {
            $project: {
                _id: 0,
                staged_epcNumbers: 1,
                scanEpcNumbers: 1,
            }
        }
    ];

    const result = await this.aggregate(pipeline);

    return result;
}

export const Audit = mongoose.model<IAudit, IAuditModel>("Audit", AuditSchema);