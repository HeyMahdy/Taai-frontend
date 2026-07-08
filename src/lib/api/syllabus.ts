import { apiClient } from "./client";
import { ENDPOINTS } from "./config";

// Types
export type SyllabusNode = {
  id: number;
  name: string;
  entity_type: string;
  description: string;
  difficulty_level: string;
  week_or_unit: string;
};

export type SyllabusEdge = {
  id: number;
  source: string;
  target: string;
  relationship_type: string;
  strength: number;
  reason: string;
};

export type SyllabusGraph = {
  nodes: SyllabusNode[];
  edges: SyllabusEdge[];
};

export type SyllabusQueryResult = {
  answer: string;
  matched_entities: { name: string; type: string; similarity: number }[];
  prerequisites: string[];
  related_topics: string[];
};

export type PrerequisiteEntry = {
  name: string;
  entity_type: string;
  difficulty_level: string;
  depth: number;
};

type SyllabusUploadResponse = {
  message: string;
  data: {
    syllabus_id: number;
    status: string;
    entity_count: number;
    relationship_count: number;
  };
};

type SyllabusGraphResponse = {
  message: string;
  data: SyllabusGraph;
};

type SyllabusQueryResponse = {
  message: string;
  data: SyllabusQueryResult;
};

type PrerequisitesResponse = {
  message: string;
  data: {
    topic: string;
    prerequisite_chain: PrerequisiteEntry[];
  };
};

// API calls

/** Upload a syllabus document for GraphRAG processing */
export async function uploadSyllabus(file: File, assignmentId: number) {
  const formData = new FormData();
  formData.append("file", file);

  return apiClient<SyllabusUploadResponse>(ENDPOINTS.SYLLABUS_UPLOAD(assignmentId), {
    method: "POST",
    body: formData as unknown as FormData,
  });
}

/** Check syllabus processing status */
export async function getSyllabusStatus(syllabusId: number) {
  return apiClient<{ message: string; data: { syllabus_id: number; status: string } }>(
    ENDPOINTS.SYLLABUS_STATUS(syllabusId)
  );
}

/** Get the knowledge graph for a syllabus */
export async function getSyllabusGraph(assignmentId: number, syllabusId: number) {
  return apiClient<SyllabusGraphResponse>(ENDPOINTS.SYLLABUS_GRAPH(assignmentId, syllabusId));
}

/** Query the syllabus with natural language */
export async function querySyllabus(query: string, syllabusId: number) {
  return apiClient<SyllabusQueryResponse>(ENDPOINTS.SYLLABUS_QUERY, {
    method: "POST",
    body: { query, syllabus_id: syllabusId } as unknown as Record<string, unknown>,
  });
}

/** Get prerequisites for a topic */
export async function getPrerequisites(syllabusId: number, topic: string) {
  return apiClient<PrerequisitesResponse>(
    ENDPOINTS.SYLLABUS_PREREQUISITES(syllabusId, topic)
  );
}
