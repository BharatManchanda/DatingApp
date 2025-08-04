export class PaginationHelper {
	static getPaginationParams(query: any, defaultLimit = 10) {
		const page = Math.max(parseInt(query.page) || 1, 1);
		const limit = Math.max(parseInt(query.limit) || defaultLimit, 1);
		const skip = (page - 1) * limit;

		return { page, limit, skip };
	}

	static formatResponse({ docs, total, page, limit }: {
		docs: any[];
		total: number;
		page: number;
		limit: number;
	}) {
		const totalPages = Math.ceil(total / limit);

		return {
			data: docs,
			pagination: {
				total,
				page,
				limit,
				totalPages,
				hasNextPage: page < totalPages,
				hasPrevPage: page > 1
			}
		};
	}
}
