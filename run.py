import subprocess
import sys
import time
import socket
from pathlib import Path


def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"


def main():
    root_dir = Path(__file__).parent.absolute()
    backend_dir = root_dir / "backend"
    frontend_dir = root_dir / "frontend"

    local_ip = get_local_ip()
    backend_port = 8000
    frontend_port = 3000

    print(f"Starting backend on http://{local_ip}:{backend_port}")
    print(f"Starting frontend on http://{local_ip}:{frontend_port}")
    print("Press Ctrl+C to stop both servers\n")

    # Start backend
    backend_cmd = [sys.executable, "-m", "uvicorn", "main:app", "--reload", "--host", "0.0.0.0", "--port",
                   str(backend_port)]
    backend_process = subprocess.Popen(backend_cmd, cwd=backend_dir)

    # Start frontend
    frontend_cmd = "npm start"
    frontend_process = subprocess.Popen(frontend_cmd, cwd=frontend_dir, shell=True)

    try:
        # Держим главный поток активным, чтобы перехватывать Ctrl+C
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nStopping servers...")

        # Завершаем оба процесса
        backend_process.terminate()
        frontend_process.terminate()

        # Ожидаем их полного завершения
        backend_process.wait()
        frontend_process.wait()

        print("Both servers have been stopped.")


if __name__ == "__main__":
    main()