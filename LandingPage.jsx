// ============================================================
// EduMind — Landing Page
// Ilova ochilganda foydalanuvchiga birinchi ko'rsatiladigan sahifa
// ============================================================

const LogoMark = ({ size = 36 }) => (
  <img
    src="/logo.png"
    width={size}
    height={size}
    alt="EduMind"
    style={{ borderRadius: size / 4, objectFit: "cover" }}
  />
);

export default function LandingPage({ onGetStarted }) {
  return (
    <>
      <style>{`
        .lp *,.lp *::before,.lp *::after{box-sizing:border-box;margin:0;padding:0}
        .lp{
          --blue:#4361EE;--purple:#7B2FBE;--blue-light:#5E7BFF;--purple-light:#9B59FF;
          --bg:#FAFAFE;--surface:#FFFFFF;--ink:#0D0E2C;--ink2:#3D3F6B;--ink3:#8B8DB8;
          --border:#E8E9F8;
          --grad:linear-gradient(135deg,#4361EE,#7B2FBE);
          --grad-text:linear-gradient(135deg,#4361EE 0%,#9B59FF 100%);
          --r:14px;
          font-family:'Inter',sans-serif;background:var(--bg);color:var(--ink);overflow-x:hidden;
        }
        .lp nav{
          position:fixed;top:0;left:0;right:0;z-index:100;
          display:flex;align-items:center;justify-content:space-between;
          padding:0 7%;height:68px;
          background:rgba(250,250,254,.88);backdrop-filter:blur(14px);
          border-bottom:1px solid var(--border);
        }
        .lp .nav-logo{display:flex;align-items:center;gap:10px;color:var(--blue)}
        .lp .nav-logo span{font-family:'Sora',sans-serif;font-size:18px;font-weight:700;
          background:var(--grad-text);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
        .lp .nav-links{display:flex;gap:32px}
        .lp .nav-links a{font-size:14px;font-weight:500;color:var(--ink2);text-decoration:none;transition:color .15s;cursor:pointer}
        .lp .nav-links a:hover{color:var(--blue)}
        .lp .nav-cta{
          padding:9px 22px;border-radius:50px;background:var(--grad);color:#fff;
          font-size:14px;font-weight:600;text-decoration:none;transition:opacity .15s;
          box-shadow:0 4px 20px rgba(67,97,238,.25);border:none;cursor:pointer;
        }
        .lp .nav-cta:hover{opacity:.88}
        .lp .hero{
          min-height:100vh;display:flex;flex-direction:column;
          align-items:center;justify-content:center;
          padding:120px 7% 80px;text-align:center;position:relative;overflow:hidden;
        }
        .lp .hero-bg{
          position:absolute;inset:0;z-index:0;
          background:
            radial-gradient(ellipse 60% 50% at 20% 50%,rgba(67,97,238,.07) 0%,transparent 70%),
            radial-gradient(ellipse 50% 60% at 80% 30%,rgba(123,47,190,.07) 0%,transparent 70%);
        }
        .lp .hero-badge{
          display:inline-flex;align-items:center;gap:8px;padding:6px 16px;border-radius:50px;
          background:rgba(67,97,238,.08);border:1px solid rgba(67,97,238,.2);
          font-size:13px;font-weight:500;color:var(--blue);margin-bottom:28px;position:relative;z-index:1;
        }
        .lp .hero-badge::before{content:'';width:7px;height:7px;border-radius:50%;background:var(--blue);animation:lp-pulse 2s infinite}
        @keyframes lp-pulse{0%,100%{opacity:1}50%{opacity:.3}}
        .lp .hero h1{
          font-family:'Sora',sans-serif;font-size:clamp(42px,6vw,76px);font-weight:800;
          line-height:1.08;letter-spacing:-2px;max-width:820px;margin:0 auto 24px;position:relative;z-index:1;
        }
        .lp .hero h1 span{background:var(--grad-text);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
        .lp .hero-sub{
          font-size:clamp(16px,2vw,20px);color:var(--ink2);max-width:560px;margin:0 auto 44px;
          line-height:1.7;position:relative;z-index:1;
        }
        .lp .hero-btns{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;position:relative;z-index:1}
        .lp .btn-primary{
          padding:14px 32px;border-radius:50px;background:var(--grad);color:#fff;
          font-size:15px;font-weight:600;text-decoration:none;border:none;cursor:pointer;
          box-shadow:0 8px 32px rgba(67,97,238,.3);transition:all .2s;
        }
        .lp .btn-primary:hover{transform:translateY(-2px);box-shadow:0 12px 40px rgba(67,97,238,.4)}
        .lp .btn-ghost{
          padding:14px 32px;border-radius:50px;background:transparent;color:var(--ink);
          font-size:15px;font-weight:600;text-decoration:none;border:1.5px solid var(--border);
          cursor:pointer;transition:all .2s;
        }
        .lp .btn-ghost:hover{border-color:var(--blue);color:var(--blue)}
        .lp .hero-note{margin-top:20px;font-size:13px;color:var(--ink3);position:relative;z-index:1}
        .lp .hero-mockup{margin-top:64px;position:relative;z-index:1;width:100%;max-width:900px}
        .lp .mockup-window{
          background:var(--surface);border:1px solid var(--border);border-radius:16px;overflow:hidden;
          box-shadow:0 24px 80px rgba(67,97,238,.12),0 4px 16px rgba(0,0,0,.06);
        }
        .lp .mockup-bar{height:40px;background:#F0F1FF;border-bottom:1px solid var(--border);display:flex;align-items:center;padding:0 16px;gap:7px}
        .lp .mockup-dot{width:11px;height:11px;border-radius:50%}
        .lp .mockup-inner{padding:24px;display:grid;grid-template-columns:200px 1fr;gap:16px;height:260px}
        .lp .mockup-sidebar{background:#F5F6FF;border-radius:10px;padding:14px}
        .lp .mockup-s-item{height:32px;border-radius:7px;margin-bottom:6px;background:var(--border)}
        .lp .mockup-s-item.active{background:var(--grad);opacity:.85}
        .lp .mockup-content{display:flex;flex-direction:column;gap:12px}
        .lp .mockup-row{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
        .lp .mockup-card{background:#F5F6FF;border-radius:10px;padding:14px;display:flex;flex-direction:column;gap:8px}
        .lp .mockup-card-top{height:10px;width:60%;border-radius:4px;background:var(--grad);opacity:.6}
        .lp .mockup-card-num{
          font-family:'Sora',sans-serif;font-size:22px;font-weight:700;
          background:var(--grad-text);-webkit-background-clip:text;-webkit-text-fill-color:transparent;
        }
        .lp .mockup-card-lbl{height:8px;width:80%;border-radius:3px;background:var(--border)}
        .lp .mockup-table{flex:1;background:#F5F6FF;border-radius:10px;overflow:hidden}
        .lp .mockup-thead{height:32px;background:rgba(67,97,238,.08);display:flex;align-items:center;padding:0 12px;gap:16px}
        .lp .mockup-th{height:8px;border-radius:3px;background:rgba(67,97,238,.3)}
        .lp .mockup-trow{height:36px;border-bottom:1px solid var(--border);display:flex;align-items:center;padding:0 12px;gap:16px}
        .lp .mockup-td{height:8px;border-radius:3px;background:var(--border)}
        .lp .mockup-td.pill{height:20px;width:54px;border-radius:20px;background:rgba(67,97,238,.12)}
        .lp .mockup-td.red{background:rgba(239,68,68,.12)}
        .lp .stats{
          padding:60px 7%;display:flex;justify-content:center;gap:0;
          border-top:1px solid var(--border);border-bottom:1px solid var(--border);background:var(--surface);
        }
        .lp .stat-item{flex:1;max-width:220px;text-align:center;padding:0 32px;border-right:1px solid var(--border)}
        .lp .stat-item:last-child{border-right:none}
        .lp .stat-num{
          font-family:'Sora',sans-serif;font-size:42px;font-weight:800;
          background:var(--grad-text);-webkit-background-clip:text;-webkit-text-fill-color:transparent;line-height:1;
        }
        .lp .stat-lbl{font-size:14px;color:var(--ink2);margin-top:8px}
        .lp section{padding:96px 7%}
        .lp .section-eye{font-size:12px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--blue);margin-bottom:14px}
        .lp .section-h{
          font-family:'Sora',sans-serif;font-size:clamp(28px,3.5vw,44px);font-weight:800;
          letter-spacing:-1px;line-height:1.15;max-width:560px;
        }
        .lp .section-h span{background:var(--grad-text);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
        .lp .section-sub{font-size:16px;color:var(--ink2);margin-top:16px;max-width:480px;line-height:1.7}
        .lp .problem{background:var(--surface)}
        .lp .problem-grid{display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:center;margin-top:56px}
        .lp .problem-cards{display:flex;flex-direction:column;gap:16px}
        .lp .prob-card{
          padding:22px 24px;border-radius:var(--r);border:1.5px solid var(--border);background:var(--bg);
          display:flex;gap:16px;align-items:flex-start;transition:border-color .2s,transform .2s;
        }
        .lp .prob-card:hover{border-color:rgba(67,97,238,.3);transform:translateX(4px)}
        .lp .prob-icon{
          width:40px;height:40px;border-radius:10px;flex-shrink:0;
          display:flex;align-items:center;justify-content:center;font-size:18px;background:rgba(67,97,238,.08);
        }
        .lp .prob-title{font-size:15px;font-weight:600;margin-bottom:5px}
        .lp .prob-text{font-size:14px;color:var(--ink2);line-height:1.6}
        .lp .features{background:var(--bg)}
        .lp .features-tabs{display:flex;gap:8px;margin:48px 0 40px;flex-wrap:wrap}
        .lp .ftab{
          padding:9px 20px;border-radius:50px;font-size:14px;font-weight:500;
          border:1.5px solid var(--border);background:var(--surface);color:var(--ink2);cursor:pointer;transition:all .15s;
        }
        .lp .ftab.active{background:var(--grad);color:#fff;border-color:transparent;box-shadow:0 4px 16px rgba(67,97,238,.25)}
        .lp .features-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
        .lp .feat-card{background:var(--surface);border:1.5px solid var(--border);border-radius:var(--r);padding:28px 26px;transition:all .2s}
        .lp .feat-card:hover{border-color:rgba(67,97,238,.25);transform:translateY(-3px);box-shadow:0 12px 40px rgba(67,97,238,.08)}
        .lp .feat-icon{
          width:48px;height:48px;border-radius:12px;display:flex;align-items:center;justify-content:center;
          font-size:22px;margin-bottom:18px;background:linear-gradient(135deg,rgba(67,97,238,.1),rgba(123,47,190,.1));
        }
        .lp .feat-title{font-size:16px;font-weight:600;margin-bottom:9px}
        .lp .feat-text{font-size:14px;color:var(--ink2);line-height:1.65}
        .lp .feat-tag{
          display:inline-block;margin-top:14px;padding:4px 11px;border-radius:20px;font-size:12px;font-weight:500;
          background:rgba(67,97,238,.08);color:var(--blue);
        }
        .lp .how{background:var(--surface)}
        .lp .how-steps{display:grid;grid-template-columns:repeat(4,1fr);gap:0;margin-top:56px;position:relative}
        .lp .how-steps::before{
          content:'';position:absolute;top:28px;left:12.5%;right:12.5%;height:2px;
          background:linear-gradient(90deg,#4361EE,#7B2FBE);z-index:0;opacity:.2;
        }
        .lp .how-step{text-align:center;padding:0 16px;position:relative;z-index:1}
        .lp .how-num{
          width:56px;height:56px;border-radius:50%;display:flex;align-items:center;justify-content:center;
          font-family:'Sora',sans-serif;font-size:20px;font-weight:800;background:var(--grad);color:#fff;
          margin:0 auto 20px;box-shadow:0 6px 24px rgba(67,97,238,.3);
        }
        .lp .how-title{font-size:15px;font-weight:600;margin-bottom:8px}
        .lp .how-text{font-size:13px;color:var(--ink2);line-height:1.6}
        .lp .testimonial{background:linear-gradient(135deg,#4361EE 0%,#7B2FBE 100%);padding:96px 7%;text-align:center}
        .lp .testi-quote{
          font-family:'Sora',sans-serif;font-size:clamp(20px,3vw,32px);font-weight:700;color:#fff;
          max-width:720px;margin:0 auto;line-height:1.4;letter-spacing:-.5px;
        }
        .lp .testi-author{margin-top:28px;font-size:14px;color:rgba(255,255,255,.7)}
        .lp .testi-author strong{color:#fff}
        .lp .pricing{background:var(--bg)}
        .lp .pricing-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:56px}
        .lp .price-card{background:var(--surface);border:1.5px solid var(--border);border-radius:var(--r);padding:32px 28px;transition:all .2s}
        .lp .price-card.featured{
          border-color:transparent;background:var(--grad);transform:scale(1.04);box-shadow:0 20px 60px rgba(67,97,238,.3);
        }
        .lp .price-card:hover:not(.featured){transform:translateY(-3px);border-color:rgba(67,97,238,.25)}
        .lp .price-name{font-size:13px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--ink3);margin-bottom:16px}
        .lp .price-card.featured .price-name{color:rgba(255,255,255,.7)}
        .lp .price-num{font-family:'Sora',sans-serif;font-size:40px;font-weight:800;letter-spacing:-1.5px;color:var(--ink)}
        .lp .price-card.featured .price-num{color:#fff}
        .lp .price-num sup{font-size:20px;vertical-align:top;margin-top:8px;display:inline-block}
        .lp .price-num sub{font-size:15px;font-weight:400;color:var(--ink2)}
        .lp .price-card.featured .price-num sub{color:rgba(255,255,255,.7)}
        .lp .price-desc{font-size:14px;color:var(--ink2);margin:8px 0 24px;line-height:1.5}
        .lp .price-card.featured .price-desc{color:rgba(255,255,255,.8)}
        .lp .price-list{list-style:none;display:flex;flex-direction:column;gap:10px;margin-bottom:28px}
        .lp .price-list li{font-size:14px;color:var(--ink2);display:flex;gap:8px;align-items:center}
        .lp .price-card.featured .price-list li{color:rgba(255,255,255,.9)}
        .lp .price-list li::before{
          content:'✓';width:18px;height:18px;border-radius:50%;background:rgba(67,97,238,.1);
          display:flex;align-items:center;justify-content:center;font-size:11px;color:var(--blue);flex-shrink:0;
        }
        .lp .price-card.featured .price-list li::before{background:rgba(255,255,255,.2);color:#fff}
        .lp .price-btn{
          width:100%;padding:13px;border-radius:50px;font-size:14px;font-weight:600;text-align:center;
          display:block;text-decoration:none;transition:all .2s;background:rgba(67,97,238,.08);color:var(--blue);
          border:none;cursor:pointer;
        }
        .lp .price-card.featured .price-btn{background:#fff;color:var(--purple)}
        .lp .price-btn:hover{transform:translateY(-1px)}
        .lp .cta-section{padding:96px 7%;text-align:center;background:var(--surface);border-top:1px solid var(--border)}
        .lp .cta-section h2{font-family:'Sora',sans-serif;font-size:clamp(28px,4vw,52px);font-weight:800;letter-spacing:-1.5px;margin-bottom:16px}
        .lp .cta-section h2 span{background:var(--grad-text);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
        .lp .cta-section p{font-size:17px;color:var(--ink2);margin-bottom:40px;line-height:1.6}
        .lp footer{
          padding:40px 7%;background:var(--ink);color:rgba(255,255,255,.5);
          display:flex;align-items:center;justify-content:space-between;font-size:13px;flex-wrap:wrap;gap:16px;
        }
        .lp .footer-logo{display:flex;align-items:center;gap:8px;color:#fff}
        .lp .footer-logo span{color:#fff;font-family:'Sora',sans-serif;font-weight:700;font-size:16px}
        @media(max-width:768px){
          .lp .nav-links{display:none}
          .lp .problem-grid,.lp .features-grid,.lp .how-steps{grid-template-columns:1fr}
          .lp .how-steps::before{display:none}
          .lp .stats{flex-wrap:wrap}
          .lp .stat-item{border-right:none;border-bottom:1px solid var(--border);padding:24px}
          .lp .pricing-grid{grid-template-columns:1fr}
          .lp .price-card.featured{transform:none}
          .lp .mockup-inner{grid-template-columns:1fr;height:auto}
        }
      `}</style>

      <div className="lp">
        {/* NAV */}
        <nav>
          <div className="nav-logo">
            <LogoMark size={28} />
            <span>edumind</span>
          </div>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#how">How it works</a>
            <a href="#pricing">Pricing</a>
            <a href="#contact">Contact</a>
          </div>
          <button className="nav-cta" onClick={onGetStarted}>Get started free</button>
        </nav>

        {/* HERO */}
        <section className="hero">
          <div className="hero-bg"></div>
          <div className="hero-badge">
            <span></span> Built for Uzbekistan's universities · AI-powered
          </div>
          <h1>Learn better.<br /><span>Teach smarter.</span><br />Empower futures.</h1>
          <p className="hero-sub">EduMind gives professors back 4 hours a day and gives every student a personal AI tutor — available 24/7 in Uzbek.</p>
          <div className="hero-btns">
            <button className="btn-primary" onClick={onGetStarted}>Start for free →</button>
            <a href="#features" className="btn-ghost">See how it works</a>
          </div>
          <p className="hero-note">No credit card · Free for first semester · Used by 5 universities</p>

          <div className="hero-mockup">
            <div className="mockup-window">
              <div className="mockup-bar">
                <div className="mockup-dot" style={{ background: "#ff5f57" }}></div>
                <div className="mockup-dot" style={{ background: "#febc2e" }}></div>
                <div className="mockup-dot" style={{ background: "#28c840" }}></div>
              </div>
              <div className="mockup-inner">
                <div className="mockup-sidebar">
                  <div className="mockup-s-item active"></div>
                  <div className="mockup-s-item"></div>
                  <div className="mockup-s-item"></div>
                  <div className="mockup-s-item"></div>
                  <div className="mockup-s-item"></div>
                </div>
                <div className="mockup-content">
                  <div className="mockup-row">
                    <div className="mockup-card">
                      <div className="mockup-card-top"></div>
                      <div className="mockup-card-num">148</div>
                      <div className="mockup-card-lbl"></div>
                    </div>
                    <div className="mockup-card">
                      <div className="mockup-card-top"></div>
                      <div className="mockup-card-num">71.4</div>
                      <div className="mockup-card-lbl"></div>
                    </div>
                    <div className="mockup-card">
                      <div className="mockup-card-top" style={{ background: "linear-gradient(135deg,#ef4444,#f97316)", opacity: 0.6 }}></div>
                      <div className="mockup-card-num" style={{ background: "linear-gradient(135deg,#ef4444,#f97316)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>7</div>
                      <div className="mockup-card-lbl"></div>
                    </div>
                  </div>
                  <div className="mockup-table">
                    <div className="mockup-thead">
                      <div className="mockup-th" style={{ width: 100 }}></div>
                      <div className="mockup-th" style={{ width: 60 }}></div>
                      <div className="mockup-th" style={{ width: 50 }}></div>
                      <div className="mockup-th" style={{ width: 70 }}></div>
                    </div>
                    <div className="mockup-trow">
                      <div className="mockup-td" style={{ width: 100 }}></div>
                      <div className="mockup-td" style={{ width: 60 }}></div>
                      <div className="mockup-td" style={{ width: 40 }}></div>
                      <div className="mockup-td pill red"></div>
                    </div>
                    <div className="mockup-trow">
                      <div className="mockup-td" style={{ width: 90 }}></div>
                      <div className="mockup-td" style={{ width: 60 }}></div>
                      <div className="mockup-td" style={{ width: 40 }}></div>
                      <div className="mockup-td pill"></div>
                    </div>
                    <div className="mockup-trow">
                      <div className="mockup-td" style={{ width: 110 }}></div>
                      <div className="mockup-td" style={{ width: 60 }}></div>
                      <div className="mockup-td" style={{ width: 40 }}></div>
                      <div className="mockup-td pill" style={{ background: "rgba(34,197,94,.12)" }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <div className="stats">
          <div className="stat-item">
            <div className="stat-num">500K+</div>
            <div className="stat-lbl">Students in Uzbekistan</div>
          </div>
          <div className="stat-item">
            <div className="stat-num">4h</div>
            <div className="stat-lbl">Saved per professor daily</div>
          </div>
          <div className="stat-item">
            <div className="stat-num">200+</div>
            <div className="stat-lbl">Universities nationwide</div>
          </div>
          <div className="stat-item">
            <div className="stat-num">30%</div>
            <div className="stat-lbl">Fewer student dropouts</div>
          </div>
        </div>

        {/* PROBLEM */}
        <section className="problem" id="problem">
          <div className="section-eye">The problem</div>
          <h2 className="section-h">Higher education is drowning in <span>manual work</span></h2>
          <p className="section-sub">Uzbekistan's universities have 500,000 students and 40,000 professors. None of them have AI tools built for their reality.</p>
          <div className="problem-grid">
            <div className="problem-cards">
              <div className="prob-card">
                <div className="prob-icon">⏰</div>
                <div>
                  <div className="prob-title">Professors lose 4–6 hours daily</div>
                  <div className="prob-text">Manual grading, paperwork, and report writing leave no time for actual teaching or research.</div>
                </div>
              </div>
              <div className="prob-card">
                <div className="prob-icon">😓</div>
                <div>
                  <div className="prob-title">Students wait days for feedback</div>
                  <div className="prob-text">By the time they hear back, they've already repeated the same mistake three more times.</div>
                </div>
              </div>
              <div className="prob-card">
                <div className="prob-icon">📊</div>
                <div>
                  <div className="prob-title">Ministry has zero visibility</div>
                  <div className="prob-text">No one knows which students are at risk, which regions are falling behind, or what's actually working.</div>
                </div>
              </div>
            </div>
            <div style={{ background: "linear-gradient(135deg,rgba(67,97,238,.06),rgba(123,47,190,.06))", borderRadius: 20, padding: 40, display: "flex", flexDirection: "column", justifyContent: "center", gap: 20, border: "1.5px solid rgba(67,97,238,.1)" }}>
              <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 22, fontWeight: 700, lineHeight: 1.4, color: "var(--ink)" }}>"I spend more time on paperwork than with my students."</div>
              <div style={{ fontSize: 14, color: "var(--ink2)" }}>— Professor, TATU Tashkent</div>
              <div style={{ height: 1, background: "var(--border)" }}></div>
              <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 22, fontWeight: 700, lineHeight: 1.4, color: "var(--ink)" }}>"I got feedback a week after submitting. I'd already failed the next test."</div>
              <div style={{ fontSize: 14, color: "var(--ink2)" }}>— 2nd year student, Samarkand SIU</div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="features" id="features">
          <div className="section-eye">What EduMind does</div>
          <h2 className="section-h">One platform. <span>Two superpowers.</span></h2>
          <p className="section-sub">Built for both sides of the classroom — because fixing one side without the other doesn't work.</p>

          <div className="features-tabs">
            <button className="ftab active">For professors</button>
            <button className="ftab">For students</button>
            <button className="ftab">For ministry</button>
          </div>

          <div className="features-grid">
            <div className="feat-card">
              <div className="feat-icon">⚡</div>
              <div className="feat-title">AI grading in seconds</div>
              <div className="feat-text">Upload any assignment. AI scores it, highlights errors, and writes detailed feedback in Uzbek — professor reviews and approves in one click.</div>
              <span className="feat-tag">Saves 3h/day</span>
            </div>
            <div className="feat-card">
              <div className="feat-icon">⚠️</div>
              <div className="feat-title">At-risk detection</div>
              <div className="feat-text">AI monitors attendance, grades, and engagement. It flags students before they fail — not after — with 91% accuracy.</div>
              <span className="feat-tag">Early warning</span>
            </div>
            <div className="feat-card">
              <div className="feat-icon">📄</div>
              <div className="feat-title">One-click reports</div>
              <div className="feat-text">Monthly progress reports written by AI, formatted for ministry submission. What used to take hours takes thirty seconds.</div>
              <span className="feat-tag">Auto-generated</span>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="how" id="how">
          <div className="section-eye">How it works</div>
          <h2 className="section-h">Up and running in <span>one day</span></h2>
          <div className="how-steps">
            <div className="how-step">
              <div className="how-num">1</div>
              <div className="how-title">University signs up</div>
              <div className="how-text">Your IT team gets a subdomain and admin access in under an hour.</div>
            </div>
            <div className="how-step">
              <div className="how-num">2</div>
              <div className="how-title">Professors import students</div>
              <div className="how-text">Upload a spreadsheet or connect your existing student information system.</div>
            </div>
            <div className="how-step">
              <div className="how-num">3</div>
              <div className="how-title">AI learns your curriculum</div>
              <div className="how-text">Upload syllabi and rubrics. EduMind calibrates grading to your standards.</div>
            </div>
            <div className="how-step">
              <div className="how-num">4</div>
              <div className="how-title">Everyone benefits</div>
              <div className="how-text">Professors grade faster, students get instant feedback, ministry sees real data.</div>
            </div>
          </div>
        </section>

        {/* TESTIMONIAL */}
        <div className="testimonial">
          <div className="testi-quote">"EduMind gave me back my evenings. I used to spend three hours every night marking code submissions. Now I spend thirty minutes reviewing what the AI flagged."</div>
          <div className="testi-author">— <strong>Aziz Karimov</strong>, Professor of Computer Science, TATU · Tashkent</div>
        </div>

        {/* PRICING */}
        <section className="pricing" id="pricing">
          <div className="section-eye">Pricing</div>
          <h2 className="section-h">Simple pricing for <span>every institution</span></h2>
          <p className="section-sub">Billed annually per institution — not per user. One contract covers everyone.</p>
          <div className="pricing-grid">
            <div className="price-card">
              <div className="price-name">Starter</div>
              <div className="price-num"><sup>$</sup>3,000<sub>/yr</sub></div>
              <div className="price-desc">For small institutions up to 2,000 students.</div>
              <ul className="price-list">
                <li>AI grading for all courses</li>
                <li>Student at-risk detection</li>
                <li>Monthly reports</li>
                <li>Email support</li>
              </ul>
              <button className="price-btn" onClick={onGetStarted}>Get started</button>
            </div>
            <div className="price-card featured">
              <div className="price-name">University</div>
              <div className="price-num"><sup>$</sup>7,000<sub>/yr</sub></div>
              <div className="price-desc">For large universities — unlimited students and professors.</div>
              <ul className="price-list">
                <li>Everything in Starter</li>
                <li>Ministry dashboard access</li>
                <li>Custom AI model fine-tuning</li>
                <li>Dedicated support manager</li>
                <li>API access</li>
              </ul>
              <button className="price-btn" onClick={onGetStarted}>Talk to sales</button>
            </div>
            <div className="price-card">
              <div className="price-name">Ministry</div>
              <div className="price-num">Custom</div>
              <div className="price-desc">National deployment across all institutions.</div>
              <ul className="price-list">
                <li>Everything in University</li>
                <li>National analytics dashboard</li>
                <li>On-premise deployment option</li>
                <li>SLA guarantee</li>
              </ul>
              <button className="price-btn" onClick={onGetStarted}>Contact us</button>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="cta-section" id="cta">
          <h2>Ready to transform <span>your university?</span></h2>
          <p>Join the institutions already using EduMind. Start free, upgrade when you're ready.</p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="btn-primary" style={{ fontSize: 16, padding: "16px 40px" }} onClick={onGetStarted}>Get started free →</button>
            <a href="#how" className="btn-ghost" style={{ fontSize: 16, padding: "16px 40px" }}>Book a demo</a>
          </div>
          <p style={{ marginTop: 20, fontSize: 13, color: "var(--ink3)" }}>No credit card required · Setup in one day · Cancel anytime</p>
        </section>

        {/* FOOTER */}
        <footer>
          <div className="footer-logo">
            <LogoMark size={24} />
            <span>edumind</span>
          </div>
          <div>© 2026 EduMind. Built for Uzbekistan's future.</div>
          <div style={{ display: "flex", gap: 20 }}>
            <a href="#" style={{ color: "rgba(255,255,255,.4)", textDecoration: "none", fontSize: 13 }}>Privacy</a>
            <a href="#" style={{ color: "rgba(255,255,255,.4)", textDecoration: "none", fontSize: 13 }}>Terms</a>
            <a href="#" style={{ color: "rgba(255,255,255,.4)", textDecoration: "none", fontSize: 13 }}>Contact</a>
          </div>
        </footer>
      </div>
    </>
  );
}
