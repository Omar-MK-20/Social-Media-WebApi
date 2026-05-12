import type { Model, MongooseUpdateQueryOptions, ProjectionType, QueryFilter, QueryOptions, Types, UpdateQuery, UpdateWithAggregationPipeline } from "mongoose";

export abstract class DBRepo<T>
{
    protected Model: Model<T>;


    constructor(model: Model<T>)
    {
        this.Model = model;
    }


    public async create(data: Partial<T>)
    {
        return await this.Model.create(data);
    };


    public async updateOne({ filter, update, options }:
        {
            filter: QueryFilter<T>;
            update: UpdateQuery<T> | UpdateWithAggregationPipeline;
            options?: (MongooseUpdateQueryOptions<T>) | null;
        })
    {
        return await this.Model.updateOne(filter, update, options);
    }


    public async find({ filter, isDeleted = false, projection, options, }:
        {
            filter: QueryFilter<T>;
            isDeleted?: boolean;
            projection?: ProjectionType<T> | null | undefined;
            options?: QueryOptions<T> & { lean: true; } | undefined;
        })
    {
        return await this.Model.find({ ...filter, isDeleted }, projection, options);
    }


    public async findOne({ filter, isDeleted = false, projection, options, }:
        {
            filter: QueryFilter<T>;
            isDeleted?: boolean;
            projection?: ProjectionType<T> | null | undefined;
            options?: QueryOptions<T> & { lean: true; } | undefined;

        })
    {
        return await this.Model.findOne({ ...filter, isDeleted }, projection, options);
    }


    public async findById({ id, isDeleted = false, projection, options, }:
        {
            id: string | Types.ObjectId;
            isDeleted?: boolean;
            projection?: ProjectionType<T> | null | undefined;
            options?: QueryOptions<T> & { lean: true; } | undefined;
        })
    {
        return await this.Model.findOne({ _id: id, isDeleted }, projection, options);
    }
}