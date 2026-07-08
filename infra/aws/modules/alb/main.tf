locals {
  internal = var.exposure_mode == "internal"
}

resource "aws_lb" "this" {
  name               = var.name
  load_balancer_type = "application"
  internal           = local.internal
  subnets            = var.subnet_ids
  security_groups    = var.security_group_ids

  enable_deletion_protection = false

  tags = var.tags
}

resource "aws_lb_target_group" "flagforge" {
  name        = "${var.name}-api"
  port        = var.target_group_port
  protocol    = var.target_group_protocol
  target_type = var.target_type
  vpc_id      = var.vpc_id

  health_check {
    enabled             = true
    path                = var.health_check_path
    protocol            = var.target_group_protocol
    matcher             = "200"
    healthy_threshold   = 2
    unhealthy_threshold = 2
    interval            = 30
    timeout             = 5
  }

  tags = merge(var.tags, {
    component = "alb-target-group"
  })
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.this.arn
  port              = var.listener_port
  protocol          = var.listener_protocol

  default_action {
    type = "fixed-response"

    fixed_response {
      content_type = "text/plain"
      message_body = "FlagForge target registration is future GitOps deployment work."
      status_code  = "404"
    }
  }

  tags = merge(var.tags, {
    component = "alb-listener"
  })
}
