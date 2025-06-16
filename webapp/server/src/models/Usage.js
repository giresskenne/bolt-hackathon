// Mock Usage model for testing - in-memory storage for test environment
class Usage {
  constructor(data) {
    Object.assign(this, {
      userId: '',
      eventType: '',
      count: 0,
      timestamp: new Date(),
      ...data
    });
  }

  static async findOne(query) {
    // In testing, we're using in-memory Maps instead of a real database
    return null;
  }

  static async create(data) {
    const usage = new Usage(data);
    return usage;
  }

  async save() {
    // In testing, we're using in-memory Maps instead of a real database
    return this;
  }

  async increment() {
    this.count += 1;
    return this;
  }
}

export default Usage;
