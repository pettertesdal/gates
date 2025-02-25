export default defineEventHandler(async event => {

    try {
        const body = await readBody(event);
        const { projectID, stageArray} = body

        if (!projectID || !Array.isArray(stageArray) || stageArray.length === 0) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Bad Request',
                data: 'Invalid projectID or empty stageArray',
            });
        }

        for (const stage of stageArray) {
            try {

                //Query logic

                console.log(`Inserted stage: ${stage} for project ${projectID}`);
                
            } catch (error) {
                console.error(`Failed to insert stage ${stage.name}:`, error);
                throw createError({
                    statusCode: 500,
                    statusMessage: 'Internal Server Error',
                    data: `Failed to insert stage ${stage.name}`,
                });
            }
        };

        return { status: 'success', message: 'Valid input' };

    } catch (error) {
        return createError({
          statusCode: 500,
          statusMessage: 'Internal Server Error',
          data: 'Failed to retrieve records',
        });
    }
  });
  