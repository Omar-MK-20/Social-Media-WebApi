import type { CreateOptions, Model, MongooseUpdateQueryOptions, ObjectId, ProjectionType, QueryFilter, QueryOptions, UpdateQuery, UpdateWithAggregationPipeline } from "mongoose";

export abstract class DBRepo<T>
{
    protected Model: Model<T>;

    constructor(model: Model<T>)
    {
        this.Model = model;
    }

    // TODO figure out the type of data parameter
    public async create(data: any, options: CreateOptions)
    {
        return await this.Model.create(data, options);
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
        id: string | ObjectId,
        projection: ProjectionType<T> | null | undefined,
        options: QueryOptions<T> & { lean: true; }
    )
    {
        return await this.Model.findById(id, projection, options);
    }
}