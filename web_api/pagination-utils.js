function extractFilterAndPaginationParams(req) {
    let pageNumber = 0;
    let pageSize = 20;
    let sort = {};
    let filter = req.body.filter;
    if (filter == undefined || filter == null) {
        filter = {};
    }

    if (req.pagination != undefined && req.pagination == null) {
        pageNumber = req.pagination.pageNo == undefined ? pageNumber : req.pagination.pageNo;
        pageSize = req.pagination.pageSize == undefined ? pageSize : req.pagination.pageSize;
        sort = req.pagination.sort == undefined ? sort : req.pagination.sort;
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