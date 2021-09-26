import React from "react";
import { Row, Col } from "antd";
import App from "./App";

export default function AppContainer() {
  return (
    <Row justify="center" style={{ textAlign: "center", paddingTop: 100 }}>
      <Col justify="center" xs={12} style={{ maxWidth: 500 }}>
        <App />
      </Col>
    </Row>
  );
}
