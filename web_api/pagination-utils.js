function extractFilterAndPaginationParams(req) {
    let pageNumber = req.body.pagination["pageNo"];
    let pageSize = req.body.pagination["pageSize"];
    let sort = req.body.pagination["sort"];
    let filter = req.body.filter;
    if (filter == undefined || filter == null) {
        filter = {};
    }

    if (pageNumber == undefined || pageNumber == null) {
        pageNumber = 0;
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