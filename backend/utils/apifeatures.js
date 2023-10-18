class  ApiFeatures {
    constructor(query, queryStr) {
        this.query = query;
        this.queryStr=queryStr
}


    //Search
    search(){
        const keyword = this.queryStr.keyword ? {
            name:{
                $regex:this.queryStr.keyword,
                $options:"i",
            }
        }:{};

        this.query = this.query.find({...keyword});
        return this;
    }



    //filter
    filter(){
        const queryCopy = {...this.queryStr}

        //Removing some field for category
        const removeFields = ["keyword","page","limit"];
        removeFields.forEach(key=>delete queryCopy[key])
        
        //Filter for price and rating
        let queryStr = JSON.stringify(queryCopy)
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g,key=>`$${key}`)

        this.query=this.query.find(JSON.parse(queryStr));
        return this;
    }

    //paginnation
    pagination(resultPerPage) {
        const currentPage = this.queryStr.page || 1;
        const skip = resultPerPage*(currentPage-1) ;

        this.query=this.query.limit(resultPerPage).skip(skip)
        return this;
    }

    //aggregated data with populated fields

    
}

module.exports = ApiFeatures;