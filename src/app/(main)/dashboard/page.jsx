import CreateAccountDrawer from '@/components/CreateAccountDrawer';
import { Card, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import React from 'react';

const DashboardPage = () => {
	return (
		<div>
			{/* BUDGET PROGRESS */}

			{/* OVERVIEW */}

			{/* ACCOUNTS GRID */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				<CreateAccountDrawer>
					<Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed">
						<CardContent className="flex flex-col items-center justify-center h-full text-muted-foreground pt-5">
							<Plus className="h-8 w-8 mb-2" />
							<p className="text-sm font-medium">Add New Account</p>
						</CardContent>
					</Card>
				</CreateAccountDrawer>
			</div>
		</div>
	);
};

export default DashboardPage;
