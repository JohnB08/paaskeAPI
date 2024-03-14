import swagger from "swagger-autogen";
const swaggerAutoGen = swagger();
const outputFile = "./swagger_ouput.json";
const endpointfiles = ["../server.js"];
swaggerAutoGen(outputFile, endpointfiles);
