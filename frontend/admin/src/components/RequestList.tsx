import { useEffect, useState } from "react";
import { requestService } from "../services/requestService";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface Request {
  id: number;
  member_name: string;
  plot_id: number;
  plot_name: string;
  status: string;
}

interface RequestListProps {
  showRequests: boolean; // Le parent contrôle l'affichage
}

export function RequestList({ showRequests }: RequestListProps) {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRequests = async () => {
      try {
        const data = await requestService.getAll();
        setRequests(data);
      } catch (err) {
        console.error("Erreur chargement demandes :", err);
      } finally {
        setLoading(false);
      }
    };
    loadRequests();
  }, []);

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await requestService.updateStatus(id, status);
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      );
    } catch (err) {
      console.error("Erreur update statut :", err);
    }
  };

  if (!showRequests) return null; // 👈 n'affiche rien si showRequests = false

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-semibold">
        Demandes d’assignation de parcelles
      </h2>

      {loading ? (
        <p>Chargement des demandes...</p>
      ) : requests.length === 0 ? (
        <p>Aucune demande pour le moment.</p>
      ) : (
        requests.map((req) => (
          <div
            key={req.id}
            className="flex items-center justify-between bg-white shadow rounded-2xl p-4"
          >
            <div>
              <p>
                <strong>Membre :</strong> {req.member_name}
              </p>
              <p>
                <strong>Parcelle :</strong> {req.plot_name} (ID : {req.plot_id})
              </p>
              <Badge
                className="rounded-full px-2 py-1"
                style={{
                  backgroundColor:
                    req.status === "accepted"
                      ? "#22c55e"
                      : req.status === "rejected"
                      ? "#ef4444"
                      : "#facc10",
                  color: req.status === "pending" ? "black" : "white",
                }}
              >
                {req.status}
              </Badge>
            </div>

            <div className="flex gap-2">
              {req.status === "pending" && (
                <>
                  <Button
                    variant="default"
                    className="bg-green-500 text-white rounded-full"
                    onClick={() => handleUpdateStatus(req.id, "accepted")}
                  >
                    Accepter
                  </Button>
                  <Button
                    variant="destructive"
                    className="rounded-full"
                    onClick={() => handleUpdateStatus(req.id, "rejected")}
                  >
                    Refuser
                  </Button>
                </>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
