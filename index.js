const { LambdaClient, AddLayerVersionPermissionCommand, InvokeAsyncRequest, InvokeCommand} = require("@aws-sdk/client-lambda");

const CONFIG = {
    region: "eu-central-1",
}

// a client can be shared by different commands.
const client = new LambdaClient({ region: CONFIG.region });

//Price per 1ms of run time (nano cent :))
const availableFunctions = [
    { name: "imsc-lambda-128", price: 21 },
    { name: "imsc-lambda-256", price: 42 },
    { name: "imsc-lambda-512", price: 83 },
    { name: "imsc-lambda-1024", price: 167 },
    { name: "imsc-lambda-2048", price: 333 },
    { name: "imsc-lambda-3072", price: 500 },
    { name: "imsc-lambda-4096", price: 667 }
];

const testDataSet = {
    user_1: 70,
    user_2: 10,
    user_3: 70,
    user_4: 20,
    user_5: 70,
    user_6: 30,
    user_7: 70,
    user_8: 70,
    user_9: 70,
    user_10: 50
}

async function execute(fn, inputData){
    const outData = await client.send(new InvokeCommand({
        FunctionName: fn.name,
        LogType: "Tail",
        Payload: JSON.stringify(inputData),
    }));

    let stringData = new TextDecoder().decode(outData.Payload);
    let logText = Buffer.from(outData.LogResult, "base64").toString("ascii");
    let billedDuration = parseInt(logText.matchAll(/Billed Duration: (?<duration>\d+) ms/gm).next().value.groups.duration);

    return {
        billedDuration,
        fn,
        price: fn.price * billedDuration
    }
}

function resToString(result){
    return `\n\tTier: ${result.fn.name} \n\tTotal Price: ${result.price} nanocent \n\tClient side time: ${result.time} ms`
}

async function runTest() {
    //Batch processing of the data
    let results = await Promise.all(availableFunctions.map(async fn => {
        let timeStart = process.hrtime();
        let data = await execute(fn, testDataSet);
        let timeEnd = process.hrtime(timeStart);
        data.time = timeEnd[1] / 1000000;   //DataTime in ms
        return data;
    }));
    //console.log(results);
    console.log("Batch execution result: ")
    results.sort((a, b) => a.price - b.price);
    console.log(`Cheapest option: ${resToString(results[0])} \n`);
    results.sort((a, b) => a.time - b.time);
    console.log(`Client side fastest: ${resToString(results[0])} \n`);

    //One by one execution
    results = await Promise.all(availableFunctions.map(async fn => {
        let timeStart = process.hrtime();
        //Split up the dataset one by one
        let data = await Promise.all(Object.keys(testDataSet).map(key => {
            return execute(fn, {[key]: testDataSet[key]})
        }));
        data = {
            billedDuration: data.reduce((previousValue, currentValue) => currentValue.billedDuration + previousValue, 0),
            fn: data[0].fn,
            price: data.reduce((previousValue, currentValue) => currentValue.price + previousValue, 0),
        }
        //let data = await execute(fn, testDataSet);
        let timeEnd = process.hrtime(timeStart);
        data.time = timeEnd[1] / 1000000;   //DataTime in ms
        return data;
    }));
    //console.log(results);
    console.log("One by one execution result: ")
    results.sort((a, b) => a.price - b.price);
    console.log(`Cheapest option: ${resToString(results[0])} \n`);
    results.sort((a, b) => a.time - b.time);
    console.log(`Client side fastest: ${resToString(results[0])} \n`);
}

(async () => {
    for (let i = 1; i <= 10; i++){
        console.log(`Test no. ${i}`)
        await runTest();
        console.log("------------------------------------\n");
    }
})()
