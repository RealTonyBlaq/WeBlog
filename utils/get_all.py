""" Helper function for retrieving objects """
import math
from sqlalchemy import func

def get_model_instances(model, filter=None, filter_id=None):
    """ Fetches and returns instances of a model """
    from api.v1.app import executor
    from flask import request
    from utils import db
    
    # get page number
    page = request.args.get('page', type=int, default=1)
    # get limit number
    limit = request.args.get('limit', type=int, default=10)

    if page < 1 or limit < 1:
        return ({'message': 'Page number\
                        or limit should not be less than 1'}, 400)
    
    # calculate start and end
    start = limit * (page - 1)

    # objs = db.query(model).slice(start, start + limit)
    # count = db.query(model).count()

    if filter and filter_id:
        query = db.query(model).filter(model[filter] == filter_id)
    else:
        query = db.query(model)

    futures = [
        executor.submit(query.slice, start, start + limit),
        executor.submit(query.count)
        ]
    objs = futures[0].result()
    count = futures[1].result()
    # create a subquery to get the number of objects
    # total_count_subquery = db.query(func.count(model.id)).scalar_subquery()

    # Main query to fetch paginated tags and total count
    # objs_query = db.query(model, total_count_subquery.label('total_count')).offset(start).limit(limit)
    # objs = objs_query.all()
    # count = objs[0].total_count if objs else 0

    total_pages = math.ceil(count / limit)

    if page != 1 and page > total_pages:
        return ({'message': 'Page out of range'}, 404)

    objs_list = [obj.to_dict() for obj in objs]
    return ({'tags': objs_list, 'page': f'{page}',
                    'total_pages': f"{total_pages}"}, 200)
