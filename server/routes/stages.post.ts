export default defineEventHandler(async event => {

    try {
        const body = await readBody(event);
        const { projectID, stages} = body

        console.log("BODY: ")
        console.log(body.stages)

        if (!projectID || !Array.isArray(body.stages) || stages.length === 0) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Bad Request',
                data: 'Invalid projectID or empty stageArray',
            });
        }

        for (const stage of body.stages) {
            try {

                await connectAndQuery(`
                    INSERT INTO [db_owner].[stages] (projectID, nr, hex, name, weight)
                    VALUES (${projectID}, '${stage.selectedNumber}', '${stage.color}', '${stage.name}', '${stage.weight}');
                  `);

                console.log(`Inserted stage: `);
                console.log(stage)
                console.log(` for project ${projectID}`)
                
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
        console.log("ERROR 2")
        return createError({
          statusCode: 500,
          statusMessage: 'Internal Server Error',
          data: 'Failed to retrieve records',
        });
    }
  });
  