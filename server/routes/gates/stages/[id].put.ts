export default defineEventHandler(async event => {
    try {
        const body = await readBody(event);
        const {prosjektID, stageArray} = body;

        if(!prosjektID || !stageArray) {
            console.log("Empty stageArray")
        }
    }
})