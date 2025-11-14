import CompanyServices from '../services/company.service';
import { Route } from '../utils/types';

export const register: Route = async (req, res, next) => {
    try {
        const {
            brand_name,
            organization,
            gstin,
            phone,
            email,
            address,
            password,
            confirm_password
        } = req.body;

        const result = await CompanyServices.register({
            brand_name,
            organization,
            gstin,
            phone,
            email,
            address,
            password,
            confirm_password
        });

        res.status(201).json(result);

    } catch (err) {
        next(err);
    }
}

// export const get: Route = async (req, res, next) => {
//     try {
//         const { type } = req.params;
//         const { page = "1", sort = "asc" } = req.query;
//         const companyId = req.data;

//         const result = await CompanyServices.getChildren({
//             companyId,
//             type,
//             page: page.toString(),
//             sort: sort.toString()
//         });

//         res.status(200).json(result);

//     } catch (err) {
//         next(err);
//     }
// }

export const assignRole: Route = async (req, res, next) => {
    try {
        const { companyId } = req.data;

        const { id } = req.params;
        const { roleName } = req.body;

        const result = await CompanyServices.assignRole({
            companyId,
            userId: id,
            roleName
        });

        return res.status(200).json(result);

    } catch (err) {
        next(err);
    }
}