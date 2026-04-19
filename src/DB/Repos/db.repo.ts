import type { Model, MongooseUpdateQueryOptions, ProjectionType, QueryFilter, QueryOptions, Types, UpdateQuery, UpdateWithAggregationPipeline } from "mongoose";

export abstract class DBRepo<T>
{
    protected Model: Model<T>;

    constructor(model: Model<T>)
    {
        this.Model = model;
    }

    // TODO figure out the type of data parameter
    public async create(data: any)
    {
        return await this.Model.create(data);
    };

    public async updateOne(
        filter: QueryFilter<T>,
        update: UpdateQuery<T> | UpdateWithAggregationPipeline,
        options?: (MongooseUpdateQueryOptions<T>) | null
    )
    {
        return await this.Model.updateOne(filter, update, options);
    }

    public async find(filter: QueryFilter<T>,
        projection: ProjectionType<T> | null | undefined,
        options: QueryOptions<T> & { lean: true; }
    )
    {
        return await this.Model.find(filter, projection, options);
    }

    public async findOne(filter: QueryFilter<T>,
        projection?: ProjectionType<T> | null | undefined,
        options?: QueryOptions<T> & { lean: true; }
    )
    {
        return await this.Model.findOne(filter, projection, options);
    }

    public async findById(
        id: string | Types.ObjectId,
        projection?: ProjectionType<T> | null | undefined,
        options?: QueryOptions<T> & { lean: true; }
    )
    {
        return await this.Model.findById(id, projection, options);
    }
}