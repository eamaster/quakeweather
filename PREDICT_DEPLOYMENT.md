# 🚀 QuakeWeather Predict - Deployment Checklist

## Pre-Deployment Checklist

### ✅ Development Environment

- [ ] Run `npm install` to install tsx and dependencies
- [ ] Run `npm run test:etas` - verify 15/15 tests pass
- [ ] Add `COHERE_API_KEY` to `.dev.vars`
- [ ] Test locally:
  - [ ] `npm run dev` (frontend on :5173)
  - [ ] `npm run worker:dev` (backend on :8787)
  - [ ] Click "🔮 Predict (Experimental)" button
  - [ ] Verify prediction panel opens
  - [ ] Enable nowcast toggle
  - [ ] Check for errors in browser console

### ✅ Model Training (Optional but Recommended)

- [ ] Review `tools/backtest/config.ts` settings
- [ ] Run `npm run train:model` (takes 10-30 min)
- [ ] Verify `public/models/nowcast.json` created
- [ ] Verify `public/models/nowcast_eval.json` created
- [ ] Check AUC > 0.60 in evaluation file
- [ ] Review feature importance coefficients

### ✅ Code Quality

- [ ] Run `npm run type-check` - no TypeScript errors
- [ ] Run `npm run build` - successful build
- [ ] Test production build: `npm run preview`
- [ ] Review browser console - no errors
- [ ] Check network tab - API calls succeed

---

## Deployment Steps

### Option 1: Cloudflare Workers (Backend Only)

```bash
# Set environment secret
npx wrangler secret put COHERE_API_KEY
# Enter: REMOVED_COHERE_API_KEY

# Deploy
npx wrangler deploy
```

**Verify**:
```bash
curl https://quakeweather-api.smah0085.workers.dev/api/health
# Should show version 2.0.0 with predict features
```

### Option 2: Full Deployment (Frontend + Backend)

**Windows**:
```bash
deploy.bat
```

**Linux/Mac**:
```bash
npm run build
npm run pages:deploy
```

**Set Environment Variables in Cloudflare Dashboard**:
1. Go to Workers & Pages → quakeweather-api
2. Settings → Variables
3. Add `COHERE_API_KEY` = `REMOVED_COHERE_API_KEY`
4. Save and redeploy

---

## Post-Deployment Verification

### Test Production APIs

**1. Health Check**:
```bash
curl https://quakeweather-api.smah0085.workers.dev/api/health
```
Expected: `{ "status": "ok", "version": "2.0.0", "features": [..., "predict", "aftershock", "explain"] }`

**2. Predict Endpoint**:
```bash
curl "https://quakeweather-api.smah0085.workers.dev/api/predict?bbox=95,-5,105,5&cellDeg=0.5&horizon=7"
```
Expected: JSON with `cells`, `max_probability`, `disclaimer`

**3. Aftershock Endpoint**:
```bash
curl "https://quakeweather-api.smah0085.workers.dev/api/aftershock?lat=0&lon=100&mag=6.0&time=$(date +%s)000&horizon=3"
```
Expected: JSON with `ring`, `center_probability`, `disclaimer`

**4. Explain Endpoint** (POST):
```bash
curl -X POST https://quakeweather-api.smah0085.workers.dev/api/explain \
  -H "Content-Type: application/json" \
  -d '{"topCells":[{"lat":0,"lon":100,"probability":0.05}],"recentEvents":[]}'
```
Expected: JSON with `explanation` (AI-generated text)

### Test Frontend

1. **Open production URL**: https://hesam.me/quakeweather
2. **Click "🔮 Predict (Experimental)"** button (bottom-right)
3. **Verify**:
   - [ ] Panel opens with purple header
   - [ ] Toggle switch works
   - [ ] Sliders adjust values
   - [ ] "Enable Nowcast" loads heatmap
   - [ ] "🤖 AI Explanation" fetches narrative
   - [ ] "📊 View Model Metrics" opens drawer
   - [ ] All disclaimers visible

4. **Test Aftershock Ring**:
   - [ ] Find a M≥5.0 earthquake (check "M4.5+ (Week)" feed)
   - [ ] Click the marker
   - [ ] Click "Show Weather & Insights"
   - [ ] Look for aftershock probability ring on map
   - [ ] Verify ring appears around earthquake

---

## 🐛 Common Issues & Fixes

### Issue: "Failed to fetch predictions"
**Symptoms**: Error in predict panel  
**Cause**: Backend not deployed or CORS issue  
**Fix**:
```bash
npx wrangler deploy  # Redeploy backend
```

### Issue: "Cohere API error 401"
**Symptoms**: AI explanation fails  
**Cause**: Invalid COHERE_API_KEY  
**Fix**:
```bash
npx wrangler secret put COHERE_API_KEY
# Re-enter correct key
```

### Issue: "Model not found" or placeholder data
**Symptoms**: Metrics show dummy values  
**Cause**: Model files not deployed  
**Fix**:
```bash
npm run train:model          # Generate model files
npm run build                # Include in dist/
npm run pages:deploy         # Deploy with models
```

### Issue: "Heatmap not visible"
**Symptoms**: No color overlay on map  
**Cause**: All probabilities below threshold  
**Fix**:
- Zoom to seismically active region
- Lower M0 threshold (try 3.5 instead of 4.5)
- Check recent earthquakes in area

### Issue: "Rate limit exceeded"
**Symptoms**: 429 error after multiple requests  
**Cause**: 30 req/10min limit reached  
**Fix**:
- Wait 10 minutes
- Or increase limit in predict/aftershock route code

---

## 📈 Monitoring & Maintenance

### Check Logs (Cloudflare Dashboard)

1. Go to Workers & Pages → quakeweather-api
2. Logs → Real-time Logs
3. Watch for:
   - ✅ Successful `/api/predict` calls
   - ✅ Cache hits (faster response)
   - ⚠️ Rate limit events
   - ❌ Errors (500s)

### Update Model (Periodic)

**Recommendation**: Retrain every 3-6 months

```bash
npm run train:model
npm run build
npm run pages:deploy
```

Why: Seismicity patterns evolve, more data improves model

### Monitor Usage

**Cloudflare Dashboard** → Analytics:
- Requests to `/api/predict`
- Requests to `/api/aftershock`
- Requests to `/api/explain`
- Cache hit rate
- Error rate

---

## 🎓 Training Variations

### Quick Test (Fast)
```typescript
{
  bbox: [95, -5, 105, 5],      // Small region
  cellDeg: 0.5,                 // Coarse grid
  train_start: "2020-01-01",    // Recent data only
}
```
**Time**: ~5 minutes  
**Use**: Quick prototyping

### Production (Recommended)
```typescript
{
  bbox: [95, -12, 141, 7],      // Full SE Asia
  cellDeg: 0.25,                // Medium grid
  train_start: "2010-01-01",    // Full history
}
```
**Time**: ~20-30 minutes  
**Use**: Best performance

### High Resolution (Slow)
```typescript
{
  bbox: [118, -8, 122, -4],     // Java only
  cellDeg: 0.1,                 // Fine grid
  train_start: "2015-01-01",    // Dense catalog era
}
```
**Time**: ~60+ minutes  
**Use**: Research or detailed regional models

---

## ✅ Final Checklist

### Before Going Live

- [ ] All 15 unit tests pass (`npm run test:etas`)
- [ ] Model trained and evaluated (AUC > 0.60)
- [ ] Frontend build successful
- [ ] Backend deployed with COHERE_API_KEY
- [ ] All 4 API endpoints tested
- [ ] Frontend predict panel works
- [ ] Disclaimers visible everywhere
- [ ] Rate limiting confirmed working
- [ ] Cache hit rate > 50% after warm-up
- [ ] Documentation updated

### User Announcements

When releasing this feature, **emphasize**:
1. ⚠️ **Experimental** and **educational only**
2. ❌ **NOT for safety decisions**
3. 📚 Based on statistical patterns, not deterministic
4. 🔬 Transparently show model performance metrics
5. 📖 Link to PREDICT_GUIDE.md for details

---

## 🎊 You're Ready!

Your QuakeWeather installation now includes:
- ✅ Full ETAS implementation
- ✅ Nowcast probability heatmaps
- ✅ Aftershock probability rings
- ✅ AI-powered explanations
- ✅ Model metrics dashboard
- ✅ Comprehensive documentation
- ✅ 15 passing unit tests

**Next**: Run `npm run test:etas` and `npm run build` to verify everything works!

---

**Happy Nowcasting! 🔮**  
(Responsibly and educationally, of course!)


