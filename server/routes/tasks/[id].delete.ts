// routes/gates/[id].get.ts

//slette prosjekt
export default defineEventHandler (async (event) => {
	const id = getRouterParam(event, 'id')
	try {

		if(id == undefined || isNaN(id as any)) {
			return createError({
                statusCode: 400,
                statusMessage: 'Bad Request',
                data: 'Invalid or missing gate ID',
            });
		} else {
		const result = await connectAndQuery(`DELETE FROM taskModel WHERE ID = ${id}`);
		}
	} catch (error) {
		return createError({
			statusCode: 400,
                statusMessage: 'Bad Request',
                data: 'Invalid or missing gate ID',
		  });
	}
});
