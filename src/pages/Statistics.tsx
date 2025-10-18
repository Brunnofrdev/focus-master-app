import { Card } from "@/components/ui/card";
import { Navigation } from "@/components/Navigation";
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Award,
  BookOpen
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

const Statistics = () => {
  // Mock data for charts
  const subjectAccuracy = [
    { subject: 'Dir. Constitucional', accuracy: 82 },
    { subject: 'Português', accuracy: 75 },
    { subject: 'Raciocínio Lógico', accuracy: 88 },
    { subject: 'Dir. Administrativo', accuracy: 79 },
    { subject: 'Informática', accuracy: 92 },
  ];

  const weeklyProgress = [
    { week: 'Sem 1', hours: 15, accuracy: 72 },
    { week: 'Sem 2', hours: 18, accuracy: 75 },
    { week: 'Sem 3', hours: 22, accuracy: 78 },
    { week: 'Sem 4', hours: 19, accuracy: 80 },
    { week: 'Sem 5', hours: 25, accuracy: 82 },
  ];

  const difficultyData = [
    { name: 'Fácil', value: 420, color: '#34d399' },
    { name: 'Médio', value: 580, color: '#6366f1' },
    { name: 'Difícil', value: 247, color: '#f59e0b' },
  ];

  const stats = [
    { label: 'Total de Horas', value: '124h', icon: BookOpen, color: 'primary' },
    { label: 'Taxa de Acerto', value: '78%', icon: Target, color: 'success' },
    { label: 'Questões Resolvidas', value: '1.247', icon: Award, color: 'accent' },
    { label: 'Evolução Mensal', value: '+12%', icon: TrendingUp, color: 'success' },
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="mb-8">
          <h1 className="mb-2">Estatísticas e Análises</h1>
          <p className="text-muted-foreground text-lg">
            Acompanhe seu desempenho e identifique áreas de melhoria
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <Icon className={`h-8 w-8 text-${stat.color}`} />
                </div>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </Card>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Subject Performance */}
          <Card className="p-6">
            <h3 className="mb-6 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Desempenho por Disciplina
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={subjectAccuracy}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="subject" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="accuracy" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Difficulty Distribution */}
          <Card className="p-6">
            <h3 className="mb-6 flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Distribuição por Dificuldade
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={difficultyData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {difficultyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4">
              {difficultyData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm">{item.value} questões</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Evolution Over Time */}
        <Card className="p-6">
          <h3 className="mb-6 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-success" />
            Evolução ao Longo do Tempo
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={weeklyProgress}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="hours" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                name="Horas de Estudo"
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="accuracy" 
                stroke="hsl(var(--success))" 
                strokeWidth={2}
                name="Taxa de Acerto (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Insights */}
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <Card className="p-6 border-l-4 border-l-success">
            <h4 className="font-semibold mb-2 text-success">✨ Ponto Forte</h4>
            <p className="text-muted-foreground">
              Excelente desempenho em <strong>Informática</strong> com 92% de acerto. 
              Continue praticando para manter esse nível!
            </p>
          </Card>

          <Card className="p-6 border-l-4 border-l-warning">
            <h4 className="font-semibold mb-2 text-warning">⚠️ Atenção Necessária</h4>
            <p className="text-muted-foreground">
              <strong>Português</strong> precisa de mais atenção (75% de acerto). 
              Recomendamos aumentar o tempo de estudo nesta disciplina.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Statistics;