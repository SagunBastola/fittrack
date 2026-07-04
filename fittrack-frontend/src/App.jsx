import React, { useState, useEffect } from 'react';

const API_BASE = "http://127.0.0.1:8000";

export default function App() {
  // --- STATE MANAGEMENT ---
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [username, setUsername] = useState(localStorage.getItem("username") || "");
  const [isLoginView, setIsLoginView] = useState(true);

  // Core Data Feeds
  const [workouts, setWorkouts] = useState([]);
  const [nutritionSummary, setNutritionSummary] = useState({
    total_calories: 0, total_protein: 0, total_carbs: 0, total_fats: 0
  });
  const [macroBlueprint, setMacroBlueprint] = useState(null);
  const [activityLevel, setActivityLevel] = useState("moderate");

  // Input Forms State
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    username: "", email: "", password: "", weight_kg: "", height_cm: "", fitness_goal: ""
  });
  const [workoutForm, setWorkoutForm] = useState({ exercise_name: "", sets: "", reps: "", weight_used: "" });
  const [nutritionForm, setNutritionForm] = useState({ food_name: "", calories: "", protein_g: "", carbs_g: "", fats_g: "" });

  // --- AUTOMATED SYNC EFFECTS ---
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      localStorage.setItem("username", username);
      fetchDashboardData();
    } else {
      localStorage.clear();
    }
  }, [token]);

  const fetchDashboardData = () => {
    fetchWorkouts();
    fetchNutritionSummary();
  };

  // --- REQUEST HEADERS HELPER ---
  const getHeaders = (isFormUrlEncoded = false) => {
    const headers = {};
    if (!isFormUrlEncoded) headers["Content-Type"] = "application/json";
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return headers;
  };

  // --- AUTH MODULE ACTIONS ---
  const handleLogin = async (e) => {
    e.preventDefault();
    const bodyParams = new URLSearchParams();
    bodyParams.append("username", loginForm.username);
    bodyParams.append("password", loginForm.password);

    try {
      const response = await fetch(`${API_BASE}/auth/token`, {
        method: "POST",
        headers: getHeaders(true),
        body: bodyParams
      });
      if (!response.ok) throw new Error("Invalid credentials");
      const data = await response.json();
      setUsername(loginForm.username);
      setToken(data.access_token);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const payload = {
      ...registerForm,
      weight_kg: parseFloat(registerForm.weight_kg),
      height_cm: parseFloat(registerForm.height_cm)
    };

    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error("Registration validation failed");
      alert("Account created successfully! Please sign in.");
      setIsLoginView(true);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLogout = () => {
    setToken("");
    setUsername("");
  };

  // --- WORKOUT MODULE ACTIONS ---
  const fetchWorkouts = async () => {
    try {
      const response = await fetch(`${API_BASE}/workouts/?limit=20`, { headers: getHeaders() });
      if (response.ok) {
        const data = await response.json();
        setWorkouts(data);
      }
    } catch (err) { console.error(err); }
  };

  const submitWorkout = async (e) => {
    e.preventDefault();
    const payload = {
      exercise_name: workoutForm.exercise_name,
      sets: parseInt(workoutForm.sets),
      reps: parseInt(workoutForm.reps),
      weight_used: parseFloat(workoutForm.weight_used)
    };

    try {
      const response = await fetch(`${API_BASE}/workouts/`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        setWorkoutForm({ exercise_name: "", sets: "", reps: "", weight_used: "" });
        fetchWorkouts();
      }
    } catch (err) { console.error(err); }
  };

  const deleteWorkout = async (id) => {
    if (!confirm("Delete this workout session permanently?")) return;
    try {
      const response = await fetch(`${API_BASE}/workouts/${id}`, {
        method: "DELETE",
        headers: getHeaders()
      });
      if (response.ok) fetchWorkouts();
    } catch (err) { console.error(err); }
  };

  // --- NUTRITION MODULE ACTIONS ---
  const fetchNutritionSummary = async () => {
    try {
      const response = await fetch(`${API_BASE}/nutrition/daily-summary`, { headers: getHeaders() });
      if (response.ok) {
        const data = await response.json();
        setNutritionSummary(data);
      }
    } catch (err) { console.error(err); }
  };

  const submitNutrition = async (e) => {
    e.preventDefault();
    const payload = {
      food_name: nutritionForm.food_name,
      calories: parseInt(nutritionForm.calories),
      protein_g: parseFloat(nutritionForm.protein_g) || 0,
      carbs_g: parseFloat(nutritionForm.carbs_g) || 0,
      fats_g: parseFloat(nutritionForm.fats_g) || 0
    };

    try {
      const response = await fetch(`${API_BASE}/nutrition/log`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        setNutritionForm({ food_name: "", calories: "", protein_g: "", carbs_g: "", fats_g: "" });
        fetchNutritionSummary();
        alert("Food item logged successfully!");
      }
    } catch (err) { console.error(err); }
  };

  // --- ANALYTICS MODULE ACTIONS ---
  const calculateMacros = async () => {
    try {
      const response = await fetch(`${API_BASE}/analytics/macro-calculator?activity_level=${activityLevel}`, {
        headers: getHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setMacroBlueprint(data);
      }
    } catch (err) { console.error(err); }
  };

  const runLifetimeExport = async () => {
    try {
      const response = await fetch(`${API_BASE}/analytics/report/export`, { headers: getHeaders() });
      if (response.ok) {
        const data = await response.json();
        alert(`--- DATA EXPORT DISPATCH ---\n\nUser: ${data.username}\nLifetime Workouts Logged: ${data.metrics_summary.lifetime_logged_workouts}\nLifetime Meals Tracked: ${data.metrics_summary.lifetime_logged_meals}\nWeight Profile: ${data.metrics_summary.current_weight_kg} kg`);
      }
    } catch (err) { console.error(err); }
  };

  // -------------------------------------------------------------
  // RENDERING COMPONENT CONDITIONAL ROUTING
  // -------------------------------------------------------------
  if (!token) {
    return (
      <div class="min-h-screen bg-gray-900 flex items-center justify-center px-4 text-gray-100">
        <div class="bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-700">
          <div class="flex justify-center mb-6">
            <span class="bg-emerald-500 text-gray-900 font-black text-xl px-4 py-2 rounded-xl">FITTRACK PRO</span>
          </div>

          {isLoginView ? (
            <form onSubmit={handleLogin} class="space-y-4">
              <h2 class="text-lg font-bold text-emerald-400 text-center">Welcome Back</h2>
              <div>
                <label class="block text-xs uppercase text-gray-400 mb-1">Username</label>
                <input type="text" required class="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500"
                  value={loginForm.username} onChange={e => setLoginForm({...loginForm, username: e.target.value})} />
              </div>
              <div>
                <label class="block text-xs uppercase text-gray-400 mb-1">Password</label>
                <input type="password" required class="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500"
                  value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} />
              </div>
              <button type="submit" class="w-full bg-emerald-500 hover:bg-emerald-600 text-gray-900 font-bold p-2.5 rounded-lg transition">Sign In</button>
              <p class="text-xs text-center text-gray-400">New to the platform? <span onClick={() => setIsLoginView(false)} class="text-emerald-400 cursor-pointer hover:underline">Create an account</span></p>
            </form>
          ) : (
            <form onSubmit={handleRegister} class="space-y-3 max-h-[75vh] overflow-y-auto pr-1">
              <h2 class="text-lg font-bold text-emerald-400 text-center">Create Fitness Profile</h2>
              <div>
                <label class="block text-xs uppercase text-gray-400 mb-1">Username</label>
                <input type="text" minLength={3} maxLength={50} required class="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500"
                  value={registerForm.username} onChange={e => setRegisterForm({...registerForm, username: e.target.value})} />
              </div>
              <div>
                <label class="block text-xs uppercase text-gray-400 mb-1">Email</label>
                <input type="email" required class="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500"
                  value={registerForm.email} onChange={e => setRegisterForm({...registerForm, email: e.target.value})} />
              </div>
              <div>
                <label class="block text-xs uppercase text-gray-400 mb-1">Password</label>
                <input type="password" minLength={6} required class="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500"
                  value={registerForm.password} onChange={e => setRegisterForm({...registerForm, password: e.target.value})} />
              </div>
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="block text-xs uppercase text-gray-400 mb-1">Weight (kg)</label>
                  <input type="number" step="0.1" required class="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500"
                    value={registerForm.weight_kg} onChange={e => setRegisterForm({...registerForm, weight_kg: e.target.value})} />
                </div>
                <div>
                  <label class="block text-xs uppercase text-gray-400 mb-1">Height (cm)</label>
                  <input type="number" step="0.1" required class="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500"
                    value={registerForm.height_cm} onChange={e => setRegisterForm({...registerForm, height_cm: e.target.value})} />
                </div>
              </div>
              <div>
                <label class="block text-xs uppercase text-gray-400 mb-1">Fitness Goal</label>
                <input type="text" placeholder="e.g. Muscle Gain, Fat Loss" required class="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500"
                  value={registerForm.fitness_goal} onChange={e => setRegisterForm({...registerForm, fitness_goal: e.target.value})} />
              </div>
              <button type="submit" class="w-full bg-emerald-500 hover:bg-emerald-600 text-gray-900 font-bold p-2.5 rounded-lg transition">Register Account</button>
              <p class="text-xs text-center text-gray-400">Already registered? <span onClick={() => setIsLoginView(true)} class="text-emerald-400 cursor-pointer hover:underline">Sign in</span></p>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div class="min-h-screen bg-gray-950 text-gray-100 flex flex-col font-sans">
      {/* HEADER NAVBAR */}
      <nav class="bg-gray-800 border-b border-gray-700 px-6 py-4 flex justify-between items-center shadow-md">
        <div class="text-emerald-400 font-black text-xl tracking-wide">FITTRACK PRO // PANEL</div>
        <div class="flex items-center space-x-4">
          <span class="bg-gray-700 px-3 py-1 rounded-full text-xs font-semibold text-gray-300 border border-gray-600">User: {username.toUpperCase()}</span>
          <button onClick={handleLogout} class="bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white px-3 py-1 rounded-lg text-xs font-bold transition">Sign Out</button>
        </div>
      </nav>

      {/* DASHBOARD GRID CONTENT WORKSPACE */}
      <main class="flex-1 p-6 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CONTAINER COLUMN 1: NUTRITION TARGETS & SUMMARY SUMMARY */}
        <div class="space-y-6">
          <div class="bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-sm">
            <h3 class="text-gray-400 font-bold uppercase tracking-wider text-xs mb-3">Today's Nutrition Summary</h3>
            <div class="grid grid-cols-2 gap-3">
              <div class="bg-gray-900 p-3 rounded-lg border border-gray-700 text-center">
                <span class="block text-2xl font-black text-emerald-400">{nutritionSummary.total_calories}</span>
                <span class="text-[10px] uppercase text-gray-400 font-bold">Calories (kcal)</span>
              </div>
              <div class="bg-gray-900 p-3 rounded-lg border border-gray-700 text-center">
                <span class="block text-lg font-bold text-sky-400">{nutritionSummary.total_protein}g</span>
                <span class="text-[10px] uppercase text-gray-400 font-bold">Protein</span>
              </div>
              <div class="bg-gray-900 p-3 rounded-lg border border-gray-700 text-center">
                <span class="block text-lg font-bold text-amber-400">{nutritionSummary.total_carbs}g</span>
                <span class="text-[10px] uppercase text-gray-400 font-bold">Carbohydrates</span>
              </div>
              <div class="bg-gray-900 p-3 rounded-lg border border-gray-700 text-center">
                <span class="block text-lg font-bold text-rose-400">{nutritionSummary.total_fats}g</span>
                <span class="text-[10px] uppercase text-gray-400 font-bold">Fats</span>
              </div>
            </div>
          </div>

          <div class="bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-sm">
            <h3 class="text-gray-400 font-bold uppercase tracking-wider text-xs mb-3">Target Macro Calculator</h3>
            <div class="flex space-x-2 mb-3">
              <select value={activityLevel} onChange={e => setActivityLevel(e.target.value)} class="flex-1 bg-gray-700 border border-gray-600 rounded-lg p-2 text-xs text-white focus:outline-none">
                <option value="sedentary">Sedentary</option>
                <option value="light">Light Activity</option>
                <option value="moderate">Moderate Activity</option>
                <option value="active">Active Athlete</option>
                <option value="extreme">Extreme Output</option>
              </select>
              <button onClick={calculateMacros} class="bg-emerald-500 text-gray-900 text-xs font-bold px-3 rounded-lg hover:bg-emerald-600">Compute</button>
            </div>
            {macroBlueprint && (
              <div class="bg-gray-900 p-3 rounded-lg border border-gray-700 text-xs space-y-1">
                <p class="flex justify-between text-gray-400"><span>Target Intake:</span> <span class="text-white font-bold">{macroBlueprint.calculated_target_calories} kcal/day</span></p>
                <p class="flex justify-between text-gray-400"><span>Protein Goal:</span> <span class="text-sky-400 font-medium">{macroBlueprint.target_macronutrients.protein_g}g</span></p>
                <p class="flex justify-between text-gray-400"><span>Carbs Goal:</span> <span class="text-amber-400 font-medium">{macroBlueprint.target_macronutrients.carbs_g}g</span></p>
                <p class="flex justify-between text-gray-400"><span>Fats Goal:</span> <span class="text-rose-400 font-medium">{macroBlueprint.target_macronutrients.fats_g}g</span></p>
              </div>
            )}
          </div>

          <button onClick={runLifetimeExport} class="w-full bg-gray-800 border border-gray-700 text-gray-300 text-xs font-semibold py-2.5 rounded-xl hover:border-emerald-500 transition">
            Generate Overall Export Data Dump
          </button>
        </div>

        {/* CONTAINER COLUMN 2: WORKOUT MANAGER SUBMODULE */}
        <div class="space-y-6">
          <div class="bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-sm">
            <h3 class="text-gray-400 font-bold uppercase tracking-wider text-xs mb-3">Track Workout Session</h3>
            <form onSubmit={submitWorkout} class="space-y-2">
              <input type="text" placeholder="Exercise Name (e.g. Squat)" required class="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                value={workoutForm.exercise_name} onChange={e => setWorkoutForm({...workoutForm, exercise_name: e.target.value})} />
              <div class="grid grid-cols-3 gap-2">
                <input type="number" placeholder="Sets" required class="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  value={workoutForm.sets} onChange={e => setWorkoutForm({...workoutForm, sets: e.target.value})} />
                <input type="number" placeholder="Reps" required class="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  value={workoutForm.reps} onChange={e => setWorkoutForm({...workoutForm, reps: e.target.value})} />
                <input type="number" step="0.1" placeholder="Wt (kg)" required class="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  value={workoutForm.weight_used} onChange={e => setWorkoutForm({...workoutForm, weight_used: e.target.value})} />
              </div>
              <button type="submit" class="w-full bg-emerald-500 text-gray-900 font-bold p-2 rounded-lg text-xs hover:bg-emerald-600 transition">Log Activity Exercise</button>
            </form>
          </div>

          <div class="bg-gray-800 p-5 rounded-xl border border-gray-700 h-[42vh] overflow-y-auto space-y-2 shadow-sm">
            <h3 class="text-gray-400 font-bold uppercase tracking-wider text-xs mb-1">Activity Log Feed</h3>
            {workouts.length === 0 ? (
              <p class="text-xs text-gray-500 italic text-center py-6">No exercises tracked yet.</p>
            ) : (
              workouts.map(item => (
                <div key={item.id} class="bg-gray-900 border border-gray-700 p-3 rounded-lg flex justify-between items-center text-xs">
                  <div>
                    <h4 class="font-bold text-gray-200 text-sm">{item.exercise_name}</h4>
                    <p class="text-gray-400 mt-0.5">{item.sets} sets × {item.reps} reps | <span class="text-emerald-400 font-medium">{item.weight_used} kg</span></p>
                  </div>
                  <button onClick={() => deleteWorkout(item.id)} class="text-gray-500 hover:text-rose-400 p-1 transition">Delete</button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* CONTAINER COLUMN 3: FOOD SELECTION TRACKER */}
        <div class="bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-sm h-fit">
          <h3 class="text-gray-400 font-bold uppercase tracking-wider text-xs mb-3">Log Food Items</h3>
          <form onSubmit={submitNutrition} class="space-y-3">
            <div>
              <label class="block text-[10px] uppercase font-bold text-gray-400 mb-0.5">Item Name</label>
              <input type="text" placeholder="e.g. Rice and Steak" required class="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                value={nutritionForm.food_name} onChange={e => setNutritionForm({...nutritionForm, food_name: e.target.value})} />
            </div>
            <div>
              <label class="block text-[10px] uppercase font-bold text-gray-400 mb-0.5">Total Calories (kcal)</label>
              <input type="number" placeholder="450" required class="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                value={nutritionForm.calories} onChange={e => setNutritionForm({...nutritionForm, calories: e.target.value})} />
            </div>
            <div class="grid grid-cols-3 gap-2">
              <div>
                <label class="block text-[9px] uppercase font-bold text-gray-400 mb-0.5">Protein (g)</label>
                <input type="number" step="0.1" class="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  value={nutritionForm.protein_g} onChange={e => setNutritionForm({...nutritionForm, protein_g: e.target.value})} />
              </div>
              <div>
                <label class="block text-[9px] uppercase font-bold text-gray-400 mb-0.5">Carbs (g)</label>
                <input type="number" step="0.1" class="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  value={nutritionForm.carbs_g} onChange={e => setNutritionForm({...nutritionForm, carbs_g: e.target.value})} />
              </div>
              <div>
                <label class="block text-[9px] uppercase font-bold text-gray-400 mb-0.5">Fats (g)</label>
                <input type="number" step="0.1" class="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  value={nutritionForm.fats_g} onChange={e => setNutritionForm({...nutritionForm, fats_g: e.target.value})} />
              </div>
            </div>
            <button type="submit" class="w-full bg-emerald-500 text-gray-900 font-bold p-2.5 rounded-lg text-xs hover:bg-emerald-600 transition">Save Log Entry</button>
          </form>
        </div>

      </main>
    </div>
  );
}