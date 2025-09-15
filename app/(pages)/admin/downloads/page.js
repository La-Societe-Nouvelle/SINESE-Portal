"use client";

import { Container, Row, Col, Card, Table, Badge, Button, Form, Alert } from "react-bootstrap";
import { Download, TrendingUp, Users, FileText, Calendar, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import PageHeader from "@/_components/PageHeader";

export default function DownloadsStatsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');
  const [selectedFile, setSelectedFile] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, [period, selectedFile]);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        period,
        ...(selectedFile && { fileId: selectedFile })
      });
      
      const response = await fetch(`/api/stats/downloads?${params}`);
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des statistiques');
      }
      
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('fr-FR').format(num);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{minHeight: '400px'}}>
        <div className="text-center">
          <RefreshCw size={24} className="spin mb-2" />
          <p>Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="downloads-stats-page">
      <PageHeader
        title="Statistiques des téléchargements"
        subtitle="Analyse des téléchargements des jeux de données SINESE"
        path="admin/downloads"
        icon={<TrendingUp size={20} />}
      />

      <Container>
        {error && (
          <Alert variant="danger" className="mb-4">
            {error}
          </Alert>
        )}

        {/* Filtres */}
        <Card className="mb-4">
          <Card.Body>
            <Row className="align-items-end">
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Période</Form.Label>
                  <Form.Select 
                    value={period} 
                    onChange={(e) => setPeriod(e.target.value)}
                  >
                    <option value="7d">7 derniers jours</option>
                    <option value="30d">30 derniers jours</option>
                    <option value="90d">90 derniers jours</option>
                    <option value="1y">1 année</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Fichier</Form.Label>
                  <Form.Select 
                    value={selectedFile} 
                    onChange={(e) => setSelectedFile(e.target.value)}
                  >
                    <option value="">Tous les fichiers</option>
                    {stats?.summary.downloadsByFile.map(file => (
                      <option key={file.fileId} value={file.fileId}>
                        {file.fileName}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={2}>
                <Button variant="primary" onClick={fetchStats} disabled={loading}>
                  <RefreshCw size={16} className="me-1" />
                  Actualiser
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {stats && (
          <>
            {/* Métriques principales */}
            <Row className="mb-4">
              <Col md={3}>
                <Card className="text-center h-100">
                  <Card.Body>
                    <Download size={32} className="text-primary mb-2" />
                    <h3 className="text-primary mb-0">{formatNumber(stats.summary.totalDownloads)}</h3>
                    <small className="text-muted">Téléchargements totaux</small>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="text-center h-100">
                  <Card.Body>
                    <Users size={32} className="text-success mb-2" />
                    <h3 className="text-success mb-0">{formatNumber(stats.summary.uniqueIPs)}</h3>
                    <small className="text-muted">Visiteurs uniques</small>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="text-center h-100">
                  <Card.Body>
                    <FileText size={32} className="text-warning mb-2" />
                    <h3 className="text-warning mb-0">{stats.summary.downloadsByFile.length}</h3>
                    <small className="text-muted">Fichiers téléchargés</small>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="text-center h-100">
                  <Card.Body>
                    <Calendar size={32} className="text-info mb-2" />
                    <h3 className="text-info mb-0">
                      {stats.summary.downloadsByDay.length > 0 
                        ? Math.round(stats.summary.totalDownloads / stats.summary.downloadsByDay.length)
                        : 0
                      }
                    </h3>
                    <small className="text-muted">Téléchargements/jour</small>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Fichiers les plus téléchargés */}
            <Row className="mb-4">
              <Col md={8}>
                <Card>
                  <Card.Header>
                    <h5 className="mb-0">Fichiers les plus téléchargés</h5>
                  </Card.Header>
                  <Card.Body>
                    <Table responsive hover>
                      <thead>
                        <tr>
                          <th>Fichier</th>
                          <th>Téléchargements</th>
                          <th>%</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.summary.downloadsByFile.slice(0, 10).map((file, index) => (
                          <tr key={file.fileId}>
                            <td>
                              <div>
                                <strong>{file.fileName}</strong>
                                <br />
                                <small className="text-muted">{file.title}</small>
                              </div>
                            </td>
                            <td>
                              <Badge bg={index === 0 ? 'primary' : 'secondary'}>
                                {formatNumber(file.count)}
                              </Badge>
                            </td>
                            <td>
                              {((file.count / stats.summary.totalDownloads) * 100).toFixed(1)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Col>
              
              {/* Top sources de trafic */}
              <Col md={4}>
                <Card>
                  <Card.Header>
                    <h5 className="mb-0">Sources de trafic</h5>
                  </Card.Header>
                  <Card.Body>
                    {stats.summary.topReferers.slice(0, 5).map((referer, index) => (
                      <div key={referer.referer} className="d-flex justify-content-between align-items-center mb-2">
                        <span className={`small ${index === 0 ? 'fw-bold' : ''}`}>
                          {referer.referer}
                        </span>
                        <Badge bg={index === 0 ? 'primary' : 'secondary'}>
                          {referer.count}
                        </Badge>
                      </div>
                    ))}
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Graphique temporel (version simplifiée) */}
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Évolution des téléchargements</h5>
              </Card.Header>
              <Card.Body>
                <div className="d-flex flex-wrap gap-2 align-items-end" style={{height: '200px'}}>
                  {stats.summary.downloadsByDay.map((day) => {
                    const maxCount = Math.max(...stats.summary.downloadsByDay.map(d => d.count));
                    const height = Math.max((day.count / maxCount) * 150, 5);
                    
                    return (
                      <div 
                        key={day.date}
                        className="d-flex flex-column align-items-center"
                        style={{minWidth: '40px'}}
                      >
                        <small className="text-muted mb-1">{day.count}</small>
                        <div 
                          className="bg-primary rounded"
                          style={{
                            width: '20px',
                            height: `${height}px`,
                            minHeight: '5px'
                          }}
                          title={`${formatDate(day.date)}: ${day.count} téléchargements`}
                        />
                        <small className="text-muted mt-1" style={{fontSize: '10px'}}>
                          {formatDate(day.date).split('/')[0]}
                        </small>
                      </div>
                    );
                  })}
                </div>
              </Card.Body>
            </Card>
          </>
        )}
      </Container>
    </div>
  );
}