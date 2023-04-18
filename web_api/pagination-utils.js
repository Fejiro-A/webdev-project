function extractFilterAndPaginationParams(req) {
    let pageNumber = 0;
    let pageSize = 20;
    let sort = {};
    let filter = req.body.filter;
    if (filter == undefined || filter == null) {
        filter = {};
    }

    if (req.body.pagination != undefined && req.body.pagination != null) {
        pageNumber = req.body.pagination.pageNo == undefined ? pageNumber : req.body.pagination.pageNo;
        pageSize = req.body.pagination.pageSize == undefined ? pageSize : req.body.pagination.pageSize;
        sort = req.body.pagination.sort == undefined ? sort : req.body.pagination.sort;
    }

    if (pageSize == undefined || pageSize == null || pageSize < 1) {
        pageSize = 20;
    }

    if (sort == undefined || sort == null) {
        sort = {};
    }

    return [filter, pageNumber, pageSize, sort];
}
module.exports = {
    extractFilterAndPaginationParams: extractFilterAndPaginationParams
};