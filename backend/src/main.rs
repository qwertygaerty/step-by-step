use actix_web::{web, App, HttpServer, HttpResponse, Responder};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::{Mutex, Arc};
use rand::Rng;
use uuid::Uuid;

#[derive(Serialize, Deserialize, Clone)]
struct StepData {
    date: String,
    steps: i32,
    is_goal: bool,
}

#[derive(Serialize, Deserialize, Clone)]
struct Goal {
    goal: i32,
}

struct AppState {
    tokens: Mutex<HashMap<String, String>>,
    steps: Mutex<HashMap<String, StepData>>,
    goal: Mutex<Option<Goal>>,
}

async fn generate_token(state: web::Data<Arc<AppState>>) -> impl Responder {
    let token = Uuid::new_v4().to_string();
    state.tokens.lock().unwrap().insert(token.clone(), token.clone());
    HttpResponse::Ok().json(token)
}

#[derive(Deserialize)]
struct StepInput {
    date: String,
    steps: i32,
    is_goal: bool,
}

async fn save_steps(state: web::Data<Arc<AppState>>, item: web::Json<StepInput>) -> impl Responder {
    let mut steps_map = state.steps.lock().unwrap();

    steps_map.insert(item.date.clone(), StepData {
        date: item.date.clone(),
        steps: item.steps,
        is_goal: item.is_goal,
    });

    HttpResponse::Ok().json("Steps saved or updated")
}

async fn get_steps_range(
    state: web::Data<Arc<AppState>>,
    path: web::Path<(String, String)>
) -> impl Responder {
    let (start_date, end_date) = path.into_inner();
    let steps_map = state.steps.lock().unwrap();

    let result: Vec<_> = steps_map
        .values()
        .filter(|step| step.date >= start_date && step.date <= end_date)
        .cloned()
        .collect();

    HttpResponse::Ok().json(result)
}

#[derive(Deserialize)]
struct GoalInput {
    goal: i32,
}

async fn save_goal(state: web::Data<Arc<AppState>>, item: web::Json<GoalInput>) -> impl Responder {
    let mut goal = state.goal.lock().unwrap();
    *goal = Some(Goal { goal: item.goal });

    HttpResponse::Ok().json("Goal saved")
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let app_state = Arc::new(AppState {
        tokens: Mutex::new(HashMap::new()),
        steps: Mutex::new(HashMap::new()),
        goal: Mutex::new(None),
    });

    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(app_state.clone()))
            .route("/token", web::get().to(generate_token))
            .route("/step", web::post().to(save_steps))
            .route("/step/{start}/{end}", web::get().to(get_steps_range))
            .route("/goal", web::post().to(save_goal))
    })
        .bind(("127.0.0.1", 8080))?
        .run()
        .await
}