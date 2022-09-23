const express=require("express")
const app=express();

const {open}=require("sqlite") 
const sqlite3=require("sqlite3")
const path=require ("path") 
module.exports=app 
const DBPath=path.join(__dirname, "covid19India.db") 
app.use(express.json());

const InitializationDBtoServer =  async () =>{
    try{
        db = await open({
            filename:DBPath,
            driver:sqlite3.Database })
            app.listen(3000, () =>{
                console.log(`Server is running at https://localhost:3000/`)
            })     
        } catch(e) {
            console.log(`DBError: ${e.message}`) 
            process.exit(1)                       
        }
}
        InitializationDBtoServer(); 
    const stateDetails=(object)=> {
        return {
            stateId:object.state_id,
            stateName: object.state_name,
            population:object.population,
        }

    }

    const DistrictDetails=(object)=> {
        return {
            districtId:object.district_id,
            districtName: object.district_name,
            stateId: object.state_id,
            cases:object.cases,
            cured:object.cured,
            active:object.active,
            deaths: object.deaths,
        }

    }


    app.get("/states/", async (request, response)=> {
            const getStates=`SELECT * FROM state`;
            const result=await db.all(getStates)
            response.send(result.map((each)=> stateDetails(each)))
        }
) 
app.get("/states/:stateId/", async (request, response)=> {
            const {stateId}=request.params 
            const getQuery=`SELECT * FROM state WHERE 
            state_id=${stateId}; `;
            const result=await db.get(getQuery) 
            response.send(stateDetails(result))
        }
) 
app.get("/districts/:districtId/", async (request, response)=> {
            const {districtId}=request.params;

            const districtQuery=`SELECT * FROM district WHERE district_id=${districtId}; `;
            const getDistrict=await db.get(districtQuery);
            response.send(DistrictDetails(getDistrict))
        }
) 
app.get("/districts/:districtId/details/", async (request, response)=> {
            const {districtId}=request.params;

            const result=`SELECT state_name FROM district WHERE district_id=${districtId}; `;

            const getResult=await db.get(result) 
            response.send(getResult.map((each)=> ( {
                            stateName: each.state_name})))}

    ) 
    app.delete("/districts/:districtId/", async (request, response)=> {
            const {districtId}=request.params;

            const query=`DELETE FROM district WHERE district_id=${districtId}; `;
            await db.run(query);
            response.send("District Removed")
        }

    ) 
    app.put("/districts/:districtId/", async (request, response)=> {
            const {districtName, stateId, cases, cured, active, deaths}=request.body;
            const {districtId}=request.params;

            const getUpdate=`UPDATE district SET district_name=${districtName},
            state_id=${stateId},
            cases=${cases},
            cured=${cured},
            active=${active},
            deaths=${deaths}

            WHERE district_id=${districtId}; `;
            await db.run(getUpdate) 
            response.send("District Details Updated")
        }

    )


    app.post("/districts/",async  (request,response) =>{
        const {districtName, stateId, cases, cured, active, deaths} = request.body;
        const postQuery = `
        INSERT INTO
        district (district_name, state_id, cases, cured, active, deaths)
        VALUES
        (${districtName},${stateId}, ${cases}, ${cured}, ${active}, ${deaths})`;
        await db.run(postQuery)
        response.send("District Successfully Added");
    })