
class ApiFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  search() {
    if (this.queryStr.keyword) {
      const keyword = this.queryStr.keyword;
      this.query = this.query.find({
        $or: [
          { title: { $regex: new RegExp(keyword, 'i') } },
          { description: { $regex: new RegExp(keyword, 'i') } },
        ],
      });
    }
    return this;
  }

  filter() {
    const { title, experience, location } = this.queryStr;

    if (title) {
      this.query = this.query.find({ title: { $regex: new RegExp(title, 'i') } });
    }

    if (experience) {
      this.query = this.query.find({ experience: parseInt(experience) });
    }

    if (location) {
      this.query = this.query.find({ location: { $regex: new RegExp(location, 'i') } });
    }

    return this;
  }

  pagination(resultPerPage) {
    const currentPage = Number(this.queryStr.page) || 1;
    const skip = resultPerPage * (currentPage - 1);
    this.query = this.query.limit(resultPerPage).skip(skip);
    return this;
  }
}

module.exports = ApiFeatures;
