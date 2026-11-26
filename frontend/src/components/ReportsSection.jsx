import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  getGoalChartData,
  getGoalReportStats,
  getHabitPieChartData,
  getHabitReportStats,
  getTaskReportStats,
  getWeeklyProductivityChartData,
  getWeeklyTaskChartData,
} from '../utils/reportUtils.js'

const TOOLTIP_STYLE = {
  backgroundColor: '#fdfbf7',
  border: '1px solid rgba(31, 27, 22, 0.14)',
  borderRadius: '8px',
  fontSize: '12px',
  color: '#1f1b16',
  boxShadow: '0 4px 12px rgba(31, 27, 22, 0.08)',
}

const AXIS_TICK = {
  fill: '#7b7266',
  fontSize: 11,
  fontFamily: 'JetBrains Mono, ui-monospace, monospace',
}

const PIE_COLORS = ['#15803d', '#e5dfd3']

/**
 * Progress Reports & Analytics view powered by live tasks, habits, goals, and activities.
 */
function ReportsSection({ tasks, habits, goals, activities }) {
  const taskStats = getTaskReportStats(tasks)
  const habitStats = getHabitReportStats(habits)
  const goalStats = getGoalReportStats(goals)

  const weeklyTaskData = getWeeklyTaskChartData(tasks, activities)
  const habitPieData = getHabitPieChartData(habits)
  const goalChartData = getGoalChartData(goals)
  const weeklyProductivityData = getWeeklyProductivityChartData(
    tasks,
    habits,
    activities,
  )

  return (
    <div className="reports-stack">
      <section className="reports-kpi-grid" aria-label="Detailed progress statistics">
        <article className="dashboard-card report-summary-card">
          <div className="card-header compact-header">
            <div>
              <h2 className="card-title">Task statistics</h2>
              <p className="card-subtitle">Current task completion</p>
            </div>
            <span className="count-meta">{taskStats.completionRate}%</span>
          </div>

          <dl className="metric-list">
            <div className="metric-row">
              <dt>Total tasks</dt>
              <dd>{taskStats.total}</dd>
            </div>
            <div className="metric-row">
              <dt>Completed tasks</dt>
              <dd>{taskStats.completed}</dd>
            </div>
            <div className="metric-row">
              <dt>Pending tasks</dt>
              <dd>{taskStats.pending}</dd>
            </div>
            <div className="metric-row">
              <dt>Completion rate</dt>
              <dd>{taskStats.completionRate}%</dd>
            </div>
          </dl>
        </article>

        <article className="dashboard-card report-summary-card">
          <div className="card-header compact-header">
            <div>
              <h2 className="card-title">Habit statistics</h2>
              <p className="card-subtitle">7-day consistency</p>
            </div>
            <span className="count-meta">
              {habitStats.weeklyCompletionRate}%
            </span>
          </div>

          <dl className="metric-list">
            <div className="metric-row">
              <dt>Total habits</dt>
              <dd>{habitStats.total}</dd>
            </div>
            <div className="metric-row">
              <dt>Completed today</dt>
              <dd>
                {habitStats.completedToday}/{habitStats.total}
              </dd>
            </div>
            <div className="metric-row">
              <dt>Weekly completion</dt>
              <dd>{habitStats.weeklyCompletionRate}%</dd>
            </div>
            <div className="metric-row">
              <dt>Best streak</dt>
              <dd>{habitStats.bestStreak} days</dd>
            </div>
          </dl>
        </article>

        <article className="dashboard-card report-summary-card">
          <div className="card-header compact-header">
            <div>
              <h2 className="card-title">Goal statistics</h2>
              <p className="card-subtitle">Overall milestone progress</p>
            </div>
            <span className="count-meta">{goalStats.averageProgress}% avg</span>
          </div>

          <dl className="metric-list">
            <div className="metric-row">
              <dt>Total goals</dt>
              <dd>{goalStats.total}</dd>
            </div>
            <div className="metric-row">
              <dt>Completed goals</dt>
              <dd>{goalStats.completed}</dd>
            </div>
            <div className="metric-row">
              <dt>In-progress goals</dt>
              <dd>{goalStats.inProgress}</dd>
            </div>
            <div className="metric-row">
              <dt>Average progress</dt>
              <dd>{goalStats.averageProgress}%</dd>
            </div>
          </dl>
        </article>
      </section>

      <section className="reports-charts-layout" aria-label="Productivity charts">
        <article className="dashboard-card chart-card chart-wide">
          <div className="card-header">
            <div>
              <h2 className="card-title">Weekly productivity trend</h2>
              <p className="card-subtitle">
                Combined daily task and habit score (0–100%)
              </p>
            </div>
          </div>

          {tasks.length === 0 && habits.length === 0 ? (
            <div className="empty-state">
              <p>Add tasks or habits to calculate your weekly productivity trend.</p>
            </div>
          ) : (
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height={260}>
                <LineChart
                  data={weeklyProductivityData}
                  margin={{ top: 8, right: 16, left: -12, bottom: 4 }}
                >
                  <CartesianGrid
                    stroke="rgba(31, 27, 22, 0.08)"
                    vertical={false}
                  />
                  <XAxis dataKey="day" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                  <YAxis
                    domain={[0, 100]}
                    tick={AXIS_TICK}
                    axisLine={false}
                    tickLine={false}
                    unit="%"
                  />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Line
                    type="monotone"
                    dataKey="score"
                    name="Productivity %"
                    stroke="#1d4ed8"
                    strokeWidth={2}
                    dot={{ r: 3.5, fill: '#1d4ed8', strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: '#1e40af' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </article>

        <article className="dashboard-card chart-card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Habit completion today</h2>
              <p className="card-subtitle">Done vs remaining habits</p>
            </div>
          </div>

          {habits.length === 0 ? (
            <div className="empty-state">
              <p>No habits available to chart.</p>
            </div>
          ) : (
            <>
              <div className="chart-wrap pie-wrap">
                <ResponsiveContainer width="100%" height={210}>
                  <PieChart>
                    <Pie
                      data={habitPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={78}
                      paddingAngle={2}
                    >
                      {habitPieData.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="pie-legend">
                <span className="legend-item">
                  <span className="legend-dot dot-positive" />
                  Completed ({habitStats.completedToday})
                </span>
                <span className="legend-item">
                  <span className="legend-dot dot-muted" />
                  Remaining ({habitStats.total - habitStats.completedToday})
                </span>
              </div>
            </>
          )}
        </article>

        <article className="dashboard-card chart-card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Weekly task completion</h2>
              <p className="card-subtitle">
                Completed and pending tasks across 7 days
              </p>
            </div>
          </div>

          {tasks.length === 0 ? (
            <div className="empty-state">
              <p>Add tasks to see your weekly task completion breakdown.</p>
            </div>
          ) : (
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={weeklyTaskData}
                  margin={{ top: 8, right: 12, left: -16, bottom: 4 }}
                >
                  <CartesianGrid
                    stroke="rgba(31, 27, 22, 0.08)"
                    vertical={false}
                  />
                  <XAxis dataKey="day" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                  <YAxis
                    allowDecimals={false}
                    tick={AXIS_TICK}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar
                    dataKey="completed"
                    name="Completed"
                    fill="#1d4ed8"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="pending"
                    name="Pending"
                    fill="#d8d1c5"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </article>

        <article className="dashboard-card chart-card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Goal progress</h2>
              <p className="card-subtitle">Completion percentage per goal</p>
            </div>
          </div>

          {goals.length === 0 ? (
            <div className="empty-state">
              <p>Create a goal to track progress in this chart.</p>
            </div>
          ) : (
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={goalChartData}
                  margin={{ top: 8, right: 12, left: -12, bottom: 4 }}
                >
                  <CartesianGrid
                    stroke="rgba(31, 27, 22, 0.08)"
                    vertical={false}
                  />
                  <XAxis dataKey="name" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                  <YAxis
                    domain={[0, 100]}
                    tick={AXIS_TICK}
                    axisLine={false}
                    tickLine={false}
                    unit="%"
                  />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Bar dataKey="progress" name="Progress %" radius={[4, 4, 0, 0]}>
                    {goalChartData.map((entry) => (
                      <Cell
                        key={entry.fullTitle}
                        fill={entry.progress === 100 ? '#15803d' : '#1d4ed8'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </article>
      </section>

      <section className="dashboard-card" aria-label="Current habit streaks">
        <div className="card-header">
          <div>
            <h2 className="card-title">Current habit streaks</h2>
            <p className="card-subtitle">Live streak count for each habit</p>
          </div>
        </div>

        {habitStats.streaks.length === 0 ? (
          <div className="empty-state">
            <p>No habits tracked yet.</p>
          </div>
        ) : (
          <div className="streak-grid">
            {habitStats.streaks.map((item) => (
              <div key={item.id} className="streak-card">
                <div className="streak-name">{item.name}</div>
                <div className="streak-meta-row">
                  <span className="streak-days">{item.streakDays} days</span>
                  <span
                    className={`habit-status ${
                      item.completedToday ? 'done' : 'pending'
                    }`}
                  >
                    {item.completedToday ? 'Done today' : 'Pending'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default ReportsSection
