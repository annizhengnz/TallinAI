from datetime import datetime
from typing import List

from crewai import Agent, Crew, Process, Task
from crewai.agents.agent_builder.base_agent import BaseAgent
from crewai.project import CrewBase, agent, crew, task
from pydantic import BaseModel, Field

from tallin.tools.inventory_tools import InventoryTools
# If you want to run a snippet of code before or after the crew starts,
# you can use the @before_kickoff and @after_kickoff decorators
# https://docs.crewai.com/concepts/crews#example-crew-class-with-decorators

@CrewBase
class Tallin():
    """Tallin crew"""

    agents: List[BaseAgent]
    tasks: List[Task]

    # Learn more about YAML configuration files here:
    # Agents: https://docs.crewai.com/concepts/agents#yaml-configuration-recommended
    # Tasks: https://docs.crewai.com/concepts/tasks#yaml-configuration-recommended
    
    # If you would like to add tools to your agents, you can learn more about it here:
    # https://docs.crewai.com/concepts/agents#agent-tools
    # Mock in-memory databases (source of truth)
    inventory = {
        "item-1": {"id": "item-1", "name": "Alpen Cereal", "sku": "AL-CER-001", "quantity": 30, "location": "Aisle 5, Shelf 1"},
        "item-2": {"id": "item-2", "name": "Rice Chex Cereal", "sku": "RC-CHX-001", "quantity": 25, "location": "Aisle 5, Shelf 2"},
        "item-3": {"id": "item-3", "name": "Grape Nuts Cereal", "sku": "GN-CER-001", "quantity": 40, "location": "Aisle 5, Shelf 1"},
        "item-4": {"id": "item-4", "name": "Great Grains Cereal", "sku": "GG-CER-001", "quantity": 35, "location": "Aisle 5, Shelf 2"},
        "item-5": {"id": "item-5", "name": "Harvest Crunch Cereal", "sku": "HC-CER-001", "quantity": 50, "location": "Aisle 5, Shelf 2"},
        "item-6": {"id": "item-6", "name": "Kellogg's All-Bran", "sku": "KL-AB-001", "quantity": 22, "location": "Aisle 5, Shelf 1"},
        "item-7": {"id": "item-7", "name": "Oatmeal Crisp", "sku": "OM-CRP-001", "quantity": 15, "location": "Aisle 5, Shelf 3"},
        "item-8": {"id": "item-8", "name": "Fibre 1 Cereal", "sku": "F1-CER-001", "quantity": 18, "location": "Aisle 5, Shelf 2"},
        "item-9": {"id": "item-9", "name": "Cinnamon Chex", "sku": "CN-CHX-001", "quantity": 33, "location": "Aisle 5, Shelf 3"},
        "item-10": {"id": "item-10", "name": "Honey Bunches of Oats", "sku": "HB-OAT-001", "quantity": 28, "location": "Aisle 5, Shelf 3"},
    }

    events = {
        "evt-1": {"id": "evt-1", "type": "Initial Stock", "timestamp": "2025-09-08T10:00:00Z", "description": "Initial inventory loaded for cereals.", "itemId": "item-1"},
        "evt-2": {"id": "evt-2", "type": "Manual Update", "timestamp": "2025-09-08T11:30:00Z", "description": "Corrected stock count for Harvest Crunch.", "itemId": "item-5"},
    }

    # Structured schema for analysis output
    class AiEvent(BaseModel):
        customer_gender: str = Field(..., description="The perceived gender of the customer.")
        customer_age_range: str = Field(..., description="The estimated age range of the customer.")
        action: str = Field(..., description="The action taken by the customer, e.g., 'picked up' or 'put back'.")
        product_name: str = Field(..., description="The name of the product involved in the interaction.")
        quantity: int = Field(..., description="The number of units of the product.")

    @agent
    def video_analyst(self) -> Agent:
        return Agent(
            config=self.agents_config['video_analyst'], # type: ignore[index]
            verbose=True
        )

    @agent
    def inventory_manager(self) -> Agent:
        tools = [
            InventoryTools(inventory=self.inventory, events=self.events)
        ]
        return Agent(
            config=self.agents_config['inventory_manager'], # type: ignore[index]
            tools=tools,
            verbose=True
        )

    # To learn more about structured task outputs,
    # task dependencies, and task callbacks, check out the documentation:
    # https://docs.crewai.com/concepts/tasks#overview-of-a-task
    @task
    def analysis_task(self) -> Task:
        return Task(
            config=self.tasks_config['analysis_task'], # type: ignore[index]
        )

    @task
    def update_task(self) -> Task:
        return Task(
            config=self.tasks_config['update_task'], # type: ignore[index]
        )

    @crew
    def crew(self) -> Crew:
        """Creates the Tallin crew"""
        # To learn how to add knowledge sources to your crew, check out the documentation:
        # https://docs.crewai.com/concepts/knowledge#what-is-knowledge

        return Crew(
            agents=self.agents,
            tasks=self.tasks,
            process=Process.sequential,
            verbose=True,
        )
