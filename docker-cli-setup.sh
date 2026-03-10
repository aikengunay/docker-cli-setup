#!/bin/bash
# Docker Engine + CLI full install for Ubuntu (official method)
set -e

echo "=== Removing old Docker (if any) ==="
sudo apt remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true

echo "=== Installing prerequisites ==="
sudo apt update
sudo apt install -y ca-certificates curl

echo "=== Adding Docker's official GPG key and repository ==="
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

echo "=== Installing Docker Engine, CLI, Containerd, and plugins ==="
sudo apt update
sudo apt install -y \
  docker-ce \
  docker-ce-cli \
  containerd.io \
  docker-buildx-plugin \
  docker-compose-plugin

echo "=== Adding your user to the docker group ==="
sudo usermod -aG docker "$USER"

echo "=== Docker install complete. Starting Docker and running test image... ==="
sudo systemctl enable docker
sudo systemctl start docker 2>/dev/null || true

# Run hello-world (with sudo so it works before next login)
sudo docker run --rm hello-world

echo ""
echo "=== All set. Log out and back in (or run: newgrp docker) so 'docker' works without sudo. ==="
echo "Installed: docker, docker compose (plugin), buildx, containerd."
