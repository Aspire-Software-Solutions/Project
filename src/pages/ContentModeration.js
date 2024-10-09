import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, 
  Table, Form, Modal, Dropdown, DropdownButton 
  } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from '../firebase'; // Ensure this is your Firebase configuration file

const ModerationDashboard = () => {

  // Init storage (needed for handling images and videos)
  const storage = getStorage();

  // State to manage filter inputs
  const [statusFilter, setStatusFilter] = useState('All');
  const [contentTypeFilter, setContentTypeFilter] = useState('All');
  const [imageUrl, setImageUrl] = useState('');

  // State for handling the modal
  const [showModal, setShowModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  // Add state to manage rejection reason
  const [rejectReason, setRejectReason] = useState(''); 

  // Add state to manage closed reports that can only viewed in a "View only"
  const [viewOnlyMode, setViewOnlyMode] = useState(false);

  // State to manage original and filtered content
  const [originalContent, setOriginalContent] = useState([]);
  const [filteredContent, setFilteredContent] = useState([]);
  const [approvedContent, setApprovedContent] = useState([]);
  const [rejectedContent, setRejectedContent] = useState([]);

  // Fetch reports from Firestore (real-time updates included)
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "reports"), (snapshot) => {
      const reportsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
  
      setOriginalContent(reportsData);

      // Apply filters for pending, approved, and rejected reports
      setFilteredContent(reportsData.filter(item => item.status === 'Pending'));
      setApprovedContent(reportsData.filter(item => item.status === 'Approved'));
      setRejectedContent(reportsData.filter(item => item.status === 'Rejected'));
    });
  
    return () => unsubscribe(); // Cleanup the listener on unmount
  }, []);

  // Function to handle opening the modal
  const handleShowModal = (report) => {
    setSelectedReport(report);
    setShowModal(true);
    setViewOnlyMode(report.status === 'Approved' || report.status === 'Rejected');  // Enable view-only mode for closed reports
    setRejectReason('');

    // Fetch the public URL for the image if the content type is Image
    if (report.type === "Image") {
      const storageRef = ref(storage, report.content);
      getDownloadURL(storageRef)
        .then((url) => setImageUrl(url))
        .catch((error) => {
          console.error("Error fetching image URL:", error);
          setImageUrl('');
        });
    } else {
      setImageUrl(''); // Reset if it's not an image
    }
  };

  // Function to handle closing the modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedReport(null);
    setImageUrl(''); // Clear image URL when modal is closed
    setRejectReason('');
  };  

  // Function to handle approve/reject actions
  const handleModerationAction = (id, action) => {
    if (action === 'reject' && !rejectReason) {
      alert('Please select a reason for rejection.');
      return;
    }
  
    setOriginalContent(prevContent => 
      prevContent.map(item => {
        if (item.id === id) {
          return { ...item, status: action === 'approve' ? 'Approved' : 'Rejected' };
        }
        return item;
      })
    );
    
    handleCloseModal(); // Close the modal after taking action
  };

  // Function to handle filter application (Optional: Extend as needed)
  const handleApplyFilters = () => {
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
                  {/* Filters to filter reports by */}
                  <Form.Group className="mb-3">
                    <Form.Label>Content Type</Form.Label>
                    <Form.Control 
                      as="select" 
                      value={contentTypeFilter} 
                      onChange={(e) => setContentTypeFilter(e.target.value)}
                    >
                      <option>All</option>
                      <option>Image</option>
                      <option>Video</option>
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
                      <th>Report ID</th>
                      <th>User Handle</th>
                      <th># Reports</th>
                      <th>Type</th>
                      <th>Content</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredContent.map(item => (
                      <tr key={item.id}>
                        <td>{item.id}</td>
                        <td>{item.user}</td>
                        <td>{item.numReports}</td>
                        <td>{item.type}</td>
                        <td>
                          {item.type === 'Image' ? '*image*' : 
                          item.content.length > 50 ? `${item.content.substring(0, 50)}...` : item.content}
                        </td>
                        <td>
                          <Button 
                            variant="info" 
                            onClick={() => handleShowModal(item)}
                          >
                            View Details
                          </Button>
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
                      <th>User Handle</th>
                      <th># Reports</th>
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
                        <td>{item.numReports}</td>
                        <td>{item.type}</td>
                        <td>
                          {item.type === 'Image' ? '*image*' : 
                          item.content.length > 50 ? `${item.content.substring(0, 50)}...` : item.content}
                        </td>
                        <td>
                          <Button 
                            variant="success"
                            onClick={() => handleShowModal(item)}
                          >
                            {item.status}
                          </Button>
                        </td>
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
                      <th>User Handle</th>
                      <th># Reports</th>
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
                        <td>{item.numReports}</td>
                        <td>{item.type}</td>
                        <td>
                          {item.type === 'Image' ? '*image*' : 
                          item.content.length > 50 ? `${item.content.substring(0, 50)}...` : item.content}
                        </td>
                        <td>
                          <Button 
                            variant="danger"
                            onClick={() => handleShowModal(item)}
                          >
                            {item.status}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

     {/* Modal for Viewing Details */}
     <Modal show={showModal} onHide={handleCloseModal} style={{color: 'black'}}>
      <Modal.Header closeButton>
        <Modal.Title>
          {selectedReport && `${selectedReport.user} Report #${selectedReport.id}`}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {selectedReport ? (
          <>
            <div>
              <strong>Type: </strong> {selectedReport.type}
            </div>
            <div>
              <strong>Content: </strong>
              {selectedReport.type === 'Image' && imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Reported content"
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              ) : selectedReport.type === 'Video' && imageUrl ? (
                <video controls style={{ maxWidth: '100%', height: 'auto' }}>
                  <source src={imageUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                selectedReport.content.length > 50
                  ? `${selectedReport.content.substring(0, 50)}...`
                  : selectedReport.content
              )}
            </div>
            <div>
              <strong>Comments: </strong>
              {selectedReport.comments && selectedReport.comments.length > 0 ? (
                selectedReport.comments.map((comment, index) => (
                  <div key={index}>
                    {`${comment.date} - ${comment.user}: ${comment.message}`}
                  </div>
                ))
              ) : (
                <div>No comments available.</div>
              )}
            </div>
          </>
        ) : (
          <div>Loading report details...</div>
        )}
      </Modal.Body>

      <Modal.Footer>
        {selectedReport && (
          <>
            {!viewOnlyMode ? (
              <>
                <Button variant="success" onClick={() => handleModerationAction(selectedReport.id, 'approve')}>
                  Approve
                </Button>

                <DropdownButton id="dropdown-rejection" title="Reject" variant="danger">
                  <Dropdown.Item onClick={() => setRejectReason('dismiss')}>
                    Dismiss report
                    <br /><small className="text-muted">There's no violation of ToS.</small>
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => setRejectReason('warn')}>
                    Remove content and warn user
                    <br /><small className="text-muted">There is a minor violation of ToS.</small>
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => setRejectReason('suspend')}>
                    Remove content and suspend user
                    <br /><small className="text-muted">There is a MAJOR violation of ToS.</small>
                  </Dropdown.Item>
                </DropdownButton>

                <Button
                  variant="danger"
                  onClick={() => handleModerationAction(selectedReport.id, 'reject')}
                  disabled={!rejectReason}
                >
                  Confirm Rejection
                </Button>
              </>
            ) : (
              <Button variant="secondary" onClick={handleCloseModal}>
                Close
              </Button>
            )}
          </>
        )}
      </Modal.Footer>
    </Modal>
    </>
  );
};

export default ModerationDashboard;
