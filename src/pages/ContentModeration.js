import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Table, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const ModerationDashboard = () => {
  // State to manage original and filtered content
  const [originalContent, setOriginalContent] = useState([
    { id: 1, user: '@john_doe', type: 'Text', content: 'Lorem ipsum dolor sit amet...', status: 'Pending' },
    { id: 2, user: '@jane_smith', type: 'Image', content: 'Image Content Placeholder', status: 'Approved' },
    { id: 3, user: '@user123', type: 'Video', content: 'Video Content Placeholder', status: 'Rejected' },
    { id: 4, user: '@mark_doe', type: 'Text', content: 'Another sample text', status: 'Approved' },
    { id: 5, user: '@lisa_smith', type: 'Image', content: 'Another image content', status: 'Rejected' }
  ]);
  
  // State to manage filter inputs
  const [statusFilter, setStatusFilter] = useState('All');
  const [contentTypeFilter, setContentTypeFilter] = useState('All');

  // Filtering content for tables
  const filteredContent = originalContent.filter(item => {
    const isPending = item.status === 'Pending';
    const statusMatch = statusFilter === 'All' || item.status === statusFilter;
    const contentTypeMatch = contentTypeFilter === 'All' || item.type === contentTypeFilter;
    return isPending && statusMatch && contentTypeMatch;
  });

  const approvedContent = originalContent.filter(item => item.status === 'Approved');
  const rejectedContent = originalContent.filter(item => item.status === 'Rejected');

  // Function to handle approve/reject actions
  const handleModerationAction = (id, action) => {
    setOriginalContent(prevContent => 
      prevContent.map(item => {
        if (item.id === id) {
          if (action === 'approve') {
            console.log(`${item.user} report has been accepted`);
            return { ...item, status: 'Approved' };
          } else if (action === 'reject') {
            console.log(`${item.user} report has been rejected`);
            return { ...item, status: 'Rejected' };
          }
        }
        return item;
      })
    );
  };

  // Function to handle filter application
  const handleApplyFilters = () => {
    // This function currently doesn't need to do much as the filter is applied via state,
    // but it's defined here to prevent errors and can be extended if needed.
    console.log('Filters applied:', { statusFilter, contentTypeFilter });
  };

  return (
    <>
      {/* Sticky Navigation Bar */}
      <div style={{
        position: 'sticky',
        top: 0,
        backgroundColor: '#f8f9fa',
        padding: '10px',
        zIndex: 1000,
        boxShadow: '0px 2px 5px rgba(0,0,0,0.1)'
      }}>
        <Container fluid>
          <Link to="/" style={{
            textDecoration: 'none',
            color: '#007bff',
            fontWeight: 'bold',
            fontSize: '1.2rem'
          }}>
            Return to main website
          </Link>
        </Container>
      </div>

      {/* Main Content */}
      <Container fluid className="mt-4">
        <Row>
          <Col md={3}>
            <Card>
              <Card.Header>Filters</Card.Header>
              <Card.Body>
                <Form onSubmit={(e) => e.preventDefault()}>
                  <Form.Group className="mb-3">
                    <Form.Label>Status</Form.Label>
                    <Form.Control 
                      as="select" 
                      value={statusFilter} 
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option>All</option>
                      <option>Pending</option>
                      <option>Approved</option>
                      <option>Rejected</option>
                    </Form.Control>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Content Type</Form.Label>
                    <Form.Control 
                      as="select" 
                      value={contentTypeFilter} 
                      onChange={(e) => setContentTypeFilter(e.target.value)}
                    >
                      <option>All</option>
                      <option>Images</option>
                      <option>Videos</option>
                      <option>Text</option>
                    </Form.Control>
                  </Form.Group>

                  <Button variant="primary" onClick={handleApplyFilters}>
                    Apply Filters
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          <Col md={9}>
            <Card>
              <Card.Header>Content Moderation</Card.Header>
              <Card.Body>
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>User</th>
                      <th>Type</th>
                      <th>Content</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredContent.map(item => (
                      <tr key={item.id}>
                        <td>{item.id}</td>
                        <td>{item.user}</td>
                        <td>{item.type}</td>
                        <td>{item.content}</td>
                        <td>{item.status}</td>
                        <td>
                          {item.status === 'Pending' && (
                            <>
                              <Button 
                                variant="success" 
                                size="sm" 
                                className="me-2"
                                onClick={() => handleModerationAction(item.id, 'approve')}
                              >
                                Approve
                              </Button>
                              <Button 
                                variant="danger" 
                                size="sm"
                                onClick={() => handleModerationAction(item.id, 'reject')}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="mt-4">
          {/* Approved Actions Table */}
          <Col xs={12} md={6}>
            <Card>
              <Card.Header>Recent Approved Actions</Card.Header>
              <Card.Body>
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>User</th>
                      <th>Type</th>
                      <th>Content</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {approvedContent.map(item => (
                      <tr key={item.id}>
                        <td>{item.id}</td>
                        <td>{item.user}</td>
                        <td>{item.type}</td>
                        <td>{item.content}</td>
                        <td>{item.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>

          {/* Rejected Actions Table */}
          <Col xs={12} md={6}>
            <Card>
              <Card.Header>Recent Rejected Actions</Card.Header>
              <Card.Body>
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>User</th>
                      <th>Type</th>
                      <th>Content</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rejectedContent.map(item => (
                      <tr key={item.id}>
                        <td>{item.id}</td>
                        <td>{item.user}</td>
                        <td>{item.type}</td>
                        <td>{item.content}</td>
                        <td>{item.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default ModerationDashboard;
